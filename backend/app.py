import os
import re
import uuid
import glob
import secrets
from datetime import datetime, timezone, timedelta
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory, session
from flask_cors import CORS

# Safeguard: On Windows, Smart App Control / Application Control policy can block unsigned Cython DLLs (*_cy*.pyd).
# Renaming them ensures SQLAlchemy seamlessly falls back to its bundled pure-Python modules.
def _ensure_pure_python_sqlalchemy():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_site = os.path.join(base_dir, 'venv', 'Lib', 'site-packages', 'sqlalchemy')
    if os.path.exists(venv_site):
        for pyd in glob.glob(os.path.join(venv_site, '**', '*_cy*.pyd'), recursive=True):
            try:
                os.rename(pyd, pyd + '.disabled')
            except OSError:
                pass

_ensure_pure_python_sqlalchemy()

from sqlalchemy import or_, desc, asc, func

from config import Config
from models import db, User, ModelItem, Collection, CollectionModel

def create_app(test_config=None):
    app = Flask(
        __name__,
        static_folder=os.path.join(os.path.dirname(Config.BASE_DIR), 'frontend'),
        static_url_path=''
    )
    app.config.from_object(Config)
    if test_config:
        app.config.update(test_config)
        if 'sqlite' in app.config.get('SQLALCHEMY_DATABASE_URI', ''):
            app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {}

    # Session cookie security settings
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True if served over HTTPS
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

    # Enable CORS with credentials support for session cookies
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

    # Initialize database
    db.init_app(app)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # -------------------------------------------------------------------------
    # CSRF Protection Helper
    # -------------------------------------------------------------------------
    def get_or_create_csrf_token():
        if 'csrf_token' not in session:
            session['csrf_token'] = secrets.token_hex(32)
        return session['csrf_token']

    @app.before_request
    def check_csrf():
        # Only check mutating HTTP methods
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            # Exempt registration, login, and health checks
            exempt_paths = [
                '/api/auth/login',
                '/api/auth/register',
                '/healthz',
                '/readyz'
            ]
            if request.path in exempt_paths:
                return None

            expected_token = session.get('csrf_token')
            provided_token = request.headers.get('X-CSRF-Token') or request.form.get('csrf_token')

            # If user has a session, token must match
            if expected_token:
                if not provided_token or not secrets.compare_digest(provided_token, expected_token):
                    return jsonify({
                        'success': False,
                        'message': 'CSRF token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.'
                    }), 403

    # -------------------------------------------------------------------------
    # Helper: Validate and save uploaded image
    # -------------------------------------------------------------------------
    def handle_image_upload(file_storage):
        if not file_storage or file_storage.filename == '':
            return None, None

        filename = file_storage.filename
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if ext not in app.config['ALLOWED_EXTENSIONS']:
            return None, f"Định dạng ảnh không hợp lệ (chỉ hỗ trợ {', '.join(app.config['ALLOWED_EXTENSIONS'])})."

        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

        try:
            image = Image.open(file_storage.stream)
            image.verify()
            file_storage.stream.seek(0)
            file_storage.save(save_path)
            return f"/uploads/{unique_filename}", None
        except Exception as e:
            return None, f"Tập tin không phải là ảnh hợp lệ hoặc bị lỗi: {str(e)}"

    def delete_local_image_if_exists(image_url):
        if not image_url or not image_url.startswith('/uploads/'):
            return
        filename = os.path.basename(image_url)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except OSError:
                pass

    # -------------------------------------------------------------------------
    # Authentication & User Management Endpoints
    # -------------------------------------------------------------------------
    @app.route('/api/auth/csrf-token', methods=['GET'])
    def get_csrf():
        token = get_or_create_csrf_token()
        return jsonify({'success': True, 'csrf_token': token}), 200

    @app.route('/api/auth/register', methods=['POST'])
    def auth_register():
        """Register a new user account with secure password hashing."""
        data = request.get_json(silent=True) or {}
        username = (data.get('username') or '').strip()
        email = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        confirm_password = data.get('confirm_password') or ''
        display_name = (data.get('display_name') or '').strip() or username

        # Validation
        if not username or not email or not password:
            return jsonify({'success': False, 'message': 'Vui lòng điền đầy đủ tên đăng nhập, email và mật khẩu.'}), 400

        if len(username) < 3 or len(username) > 50:
            return jsonify({'success': False, 'message': 'Tên đăng nhập phải từ 3 đến 50 ký tự.'}), 400

        if not re.match(r'^[a-zA-Z0-9_.-]+$', username):
            return jsonify({'success': False, 'message': 'Tên đăng nhập chỉ chứa chữ cái, số, dấu chấm, gạch ngang hoặc gạch dưới.'}), 400

        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, email):
            return jsonify({'success': False, 'message': 'Định dạng email không hợp lệ.'}), 400

        if len(password) < 8:
            return jsonify({'success': False, 'message': 'Mật khẩu phải có độ dài tối thiểu 8 ký tự.'}), 400

        if password != confirm_password:
            return jsonify({'success': False, 'message': 'Mật khẩu xác nhận không khớp.'}), 400

        # Check existing username and email
        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'message': 'Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'Email này đã được đăng ký.'}), 400

        try:
            new_user = User(
                username=username,
                email=email,
                display_name=display_name
            )
            new_user.set_password(password)

            db.session.add(new_user)
            db.session.commit()

            # Establish session immediately
            session.permanent = True
            session['user_id'] = new_user.id
            token = get_or_create_csrf_token()

            return jsonify({
                'success': True,
                'message': f'Đăng ký tài khoản thành công! Xin chào, {new_user.display_name}.',
                'user': new_user.to_dict(),
                'csrf_token': token
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Lỗi khi đăng ký tài khoản: {str(e)}'}), 500

    @app.route('/api/auth/login', methods=['POST'])
    def auth_login():
        """Authenticate user against MySQL database."""
        data = request.get_json(silent=True) or {}
        username_or_email = (data.get('username') or '').strip()
        password = data.get('password') or ''

        if not username_or_email or not password:
            return jsonify({'success': False, 'message': 'Vui lòng nhập tên đăng nhập (hoặc email) và mật khẩu.'}), 400

        # Query user by username or email
        user = User.query.filter(
            or_(
                User.username == username_or_email,
                User.email == username_or_email.lower()
            )
        ).first()

        if not user or not user.check_password(password):
            return jsonify({'success': False, 'message': 'Tên đăng nhập hoặc mật khẩu không chính xác.'}), 401

        session.permanent = True
        session['user_id'] = user.id
        token = get_or_create_csrf_token()

        return jsonify({
            'success': True,
            'message': f'Đăng nhập thành công! Chào mừng {user.display_name or user.username} trở lại.',
            'user': user.to_dict(),
            'csrf_token': token
        }), 200

    @app.route('/api/auth/logout', methods=['POST'])
    def auth_logout():
        """Safely destroy session on logout."""
        session.clear()
        return jsonify({'success': True, 'message': 'Đã đăng xuất an toàn.'}), 200

    @app.route('/api/auth/me', methods=['GET'])
    def auth_me():
        """Retrieve current session user profile."""
        token = get_or_create_csrf_token()
        user_id = session.get('user_id')

        if not user_id:
            return jsonify({
                'success': True,
                'authenticated': False,
                'user': None,
                'csrf_token': token
            }), 200

        user = db.session.get(User, user_id)
        if not user:
            session.clear()
            return jsonify({
                'success': True,
                'authenticated': False,
                'user': None,
                'csrf_token': token
            }), 200

        return jsonify({
            'success': True,
            'authenticated': True,
            'user': user.to_dict(),
            'csrf_token': token
        }), 200

    # -------------------------------------------------------------------------
    # System & Health Check Endpoints
    # -------------------------------------------------------------------------
    @app.route('/healthz', methods=['GET'])
    def healthz():
        return jsonify({'status': 'ok', 'timestamp': datetime.now(timezone.utc).isoformat()}), 200

    @app.route('/readyz', methods=['GET'])
    def readyz():
        try:
            db.session.execute(db.text('SELECT 1'))
            return jsonify({
                'status': 'ready',
                'database': 'connected',
                'timestamp': datetime.now(timezone.utc).isoformat()
            }), 200
        except Exception as e:
            return jsonify({
                'status': 'not_ready',
                'database': 'disconnected',
                'error': str(e)
            }), 503

    # -------------------------------------------------------------------------
    # Static Uploads Serving
    # -------------------------------------------------------------------------
    @app.route('/uploads/<path:filename>', methods=['GET'])
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # -------------------------------------------------------------------------
    # REST API: Models Endpoints
    # -------------------------------------------------------------------------
    @app.route('/api/models', methods=['GET'])
    def get_models():
        """
        Retrieve models with search, category, brand, and sort.
        Supports filter my_models=true for authenticated users.
        Strict Privacy: Prices and purchase dates are hidden for non-owners.
        """
        try:
            current_user_id = session.get('user_id')
            query = ModelItem.query
            search = request.args.get('search', '').strip()
            category = request.args.get('category', '').strip()
            brand = request.args.get('brand', '').strip()
            sort = request.args.get('sort', 'newest').strip()
            my_models = request.args.get('my_models', '').lower() == 'true'

            # If user explicitly requested only their models
            if my_models:
                if not current_user_id:
                    return jsonify({'success': False, 'message': 'Vui lòng đăng nhập để xem mô hình của bạn.'}), 401
                query = query.filter(ModelItem.owner_id == current_user_id)

            if search:
                search_term = f"%{search}%"
                query = query.filter(
                    or_(
                        ModelItem.name.ilike(search_term),
                        ModelItem.brand.ilike(search_term),
                        ModelItem.description.ilike(search_term)
                    )
                )

            if category and category.lower() != 'all':
                query = query.filter(ModelItem.category == category)

            if brand and brand.lower() != 'all':
                query = query.filter(ModelItem.brand == brand)

            # Sort options
            if sort == 'oldest':
                query = query.order_by(asc(ModelItem.created_at))
            elif sort == 'name_asc':
                query = query.order_by(asc(ModelItem.name))
            elif sort == 'name_desc':
                query = query.order_by(desc(ModelItem.name))
            elif sort == 'price_desc':
                query = query.order_by(desc(ModelItem.price))
            elif sort == 'price_asc':
                query = query.order_by(asc(ModelItem.price))
            else:
                query = query.order_by(desc(ModelItem.created_at))

            items = query.all()
            return jsonify({
                'success': True,
                'count': len(items),
                'data': [item.to_dict(current_user_id=current_user_id) for item in items]
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': f'Lỗi khi tải danh sách mô hình: {str(e)}'}), 500

    @app.route('/api/models/<int:model_id>', methods=['GET'])
    def get_model(model_id):
        """Retrieve single model details by ID with privacy protection."""
        current_user_id = session.get('user_id')
        item = db.session.get(ModelItem, model_id)
        if not item:
            return jsonify({'success': False, 'message': 'Không tìm thấy mô hình với ID này.'}), 404
        return jsonify({'success': True, 'data': item.to_dict(current_user_id=current_user_id)}), 200

    @app.route('/api/models', methods=['POST'])
    def create_model():
        """Create a new model item. Requires authentication."""
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập để thêm mô hình.'}), 401

        try:
            if request.content_type and 'multipart/form-data' in request.content_type:
                data = request.form.to_dict()
                file_storage = request.files.get('image')
            else:
                data = request.get_json(silent=True) or {}
                file_storage = None

            name = (data.get('name') or '').strip()
            if not name:
                return jsonify({'success': False, 'message': 'Tên mô hình là bắt buộc.'}), 400

            category = (data.get('category') or 'Car').strip()
            if not category:
                category = 'Car'
            category = category[:50]

            brand = (data.get('brand') or '').strip()
            scale = (data.get('scale') or '').strip()
            description = (data.get('description') or '').strip()

            raw_price = data.get('price')
            price = None
            if raw_price is not None and str(raw_price).strip() != '':
                try:
                    price = float(raw_price)
                except ValueError:
                    return jsonify({'success': False, 'message': 'Giá mua phải là con số hợp lệ.'}), 400

            raw_date = data.get('purchase_date')
            purchase_date = None
            if raw_date and str(raw_date).strip() != '':
                try:
                    purchase_date = datetime.strptime(str(raw_date).strip(), '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'success': False, 'message': 'Định dạng ngày mua không đúng (YYYY-MM-DD).'}), 400

            image_url = (data.get('image_url') or '').strip()
            if file_storage:
                uploaded_path, err = handle_image_upload(file_storage)
                if err:
                    return jsonify({'success': False, 'message': err}), 400
                if uploaded_path:
                    image_url = uploaded_path

            new_item = ModelItem(
                owner_id=current_user_id,
                name=name,
                category=category,
                brand=brand,
                scale=scale,
                price=price,
                purchase_date=purchase_date,
                image_url=image_url,
                description=description
            )

            db.session.add(new_item)
            db.session.commit()

            return jsonify({
                'success': True,
                'message': 'Đã thêm mô hình mới thành công!',
                'data': new_item.to_dict(current_user_id=current_user_id)
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Lỗi khi thêm mô hình: {str(e)}'}), 500

    @app.route('/api/models/<int:model_id>', methods=['PUT'])
    def update_model(model_id):
        """Update existing model item. Strictly requires ownership."""
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập để chỉnh sửa mô hình.'}), 401

        try:
            item = db.session.get(ModelItem, model_id)
            if not item:
                return jsonify({'success': False, 'message': 'Không tìm thấy mô hình cần sửa.'}), 404

            # Ownership check
            if item.owner_id != current_user_id:
                return jsonify({'success': False, 'message': 'Bạn không có quyền chỉnh sửa mô hình của người khác.'}), 403

            if request.content_type and 'multipart/form-data' in request.content_type:
                data = request.form.to_dict()
                file_storage = request.files.get('image')
            else:
                data = request.get_json(silent=True) or {}
                file_storage = None

            if 'name' in data:
                name = data.get('name', '').strip()
                if not name:
                    return jsonify({'success': False, 'message': 'Tên mô hình không được để trống.'}), 400
                item.name = name

            if 'category' in data:
                category = data.get('category', '').strip()
                if category:
                    item.category = category[:50]

            if 'brand' in data:
                item.brand = data.get('brand', '').strip()

            if 'scale' in data:
                item.scale = data.get('scale', '').strip()

            if 'description' in data:
                item.description = data.get('description', '').strip()

            if 'price' in data:
                raw_price = data.get('price')
                if raw_price is None or str(raw_price).strip() == '':
                    item.price = None
                else:
                    try:
                        item.price = float(raw_price)
                    except ValueError:
                        return jsonify({'success': False, 'message': 'Giá mua phải là con số hợp lệ.'}), 400

            if 'purchase_date' in data:
                raw_date = data.get('purchase_date')
                if not raw_date or str(raw_date).strip() == '':
                    item.purchase_date = None
                else:
                    try:
                        item.purchase_date = datetime.strptime(str(raw_date).strip(), '%Y-%m-%d').date()
                    except ValueError:
                        return jsonify({'success': False, 'message': 'Định dạng ngày mua không đúng (YYYY-MM-DD).'}), 400

            if file_storage:
                uploaded_path, err = handle_image_upload(file_storage)
                if err:
                    return jsonify({'success': False, 'message': err}), 400
                if uploaded_path:
                    if item.image_url and item.image_url != uploaded_path:
                        delete_local_image_if_exists(item.image_url)
                    item.image_url = uploaded_path
            elif 'image_url' in data:
                new_url = data.get('image_url', '').strip()
                if new_url != item.image_url:
                    delete_local_image_if_exists(item.image_url)
                    item.image_url = new_url

            item.updated_at = datetime.now(timezone.utc)
            db.session.commit()

            return jsonify({
                'success': True,
                'message': 'Cập nhật mô hình thành công!',
                'data': item.to_dict(current_user_id=current_user_id)
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Lỗi khi cập nhật mô hình: {str(e)}'}), 500

    @app.route('/api/models/<int:model_id>', methods=['DELETE'])
    def delete_model(model_id):
        """Delete model by ID. Strictly requires ownership."""
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập để xóa mô hình.'}), 401

        try:
            item = db.session.get(ModelItem, model_id)
            if not item:
                return jsonify({'success': False, 'message': 'Không tìm thấy mô hình để xóa.'}), 404

            # Ownership check
            if item.owner_id != current_user_id:
                return jsonify({'success': False, 'message': 'Bạn không có quyền xóa mô hình của người khác.'}), 403

            if item.image_url:
                delete_local_image_if_exists(item.image_url)

            db.session.delete(item)
            db.session.commit()

            return jsonify({
                'success': True,
                'message': f'Đã xóa mô hình "{item.name}" thành công.'
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Lỗi khi xóa mô hình: {str(e)}'}), 500

    @app.route('/api/stats', methods=['GET'])
    def get_stats():
        """Retrieve aggregated stats for dashboard."""
        try:
            current_user_id = session.get('user_id')
            total = ModelItem.query.count()

            # Dynamic category breakdown
            cat_counts = db.session.query(
                ModelItem.category,
                func.count(ModelItem.id)
            ).filter(ModelItem.category != None, ModelItem.category != '').group_by(ModelItem.category).order_by(desc(func.count(ModelItem.id))).all()

            categories_dict = {c[0]: c[1] for c in cat_counts}
            for base_cat in ['Car', 'Gundam', 'Other']:
                if base_cat not in categories_dict:
                    categories_dict[base_cat] = 0

            available_categories = [c[0] for c in cat_counts]
            for base_cat in ['Car', 'Gundam', 'Other']:
                if base_cat not in available_categories:
                    available_categories.append(base_cat)

            total_cars = categories_dict.get('Car', 0)
            total_gundams = categories_dict.get('Gundam', 0)
            total_others = sum(cnt for cat_name, cnt in categories_dict.items() if cat_name not in ['Car', 'Gundam'])

            # Total collection value
            total_val_res = db.session.query(func.sum(ModelItem.price)).scalar()
            total_value = float(total_val_res) if total_val_res is not None else 0.0

            # Personal stats if logged in
            my_total = 0
            my_value = 0.0
            if current_user_id:
                my_total = ModelItem.query.filter_by(owner_id=current_user_id).count()
                my_val_res = db.session.query(func.sum(ModelItem.price)).filter(ModelItem.owner_id == current_user_id).scalar()
                my_value = float(my_val_res) if my_val_res is not None else 0.0

            # Brand breakdown
            brand_counts = db.session.query(
                ModelItem.brand,
                func.count(ModelItem.id)
            ).filter(ModelItem.brand != None, ModelItem.brand != '').group_by(ModelItem.brand).order_by(desc(func.count(ModelItem.id))).limit(8).all()

            recent_items = ModelItem.query.order_by(desc(ModelItem.created_at)).limit(5).all()
            all_brands = [b[0] for b in db.session.query(ModelItem.brand).filter(ModelItem.brand != None, ModelItem.brand != '').distinct().order_by(ModelItem.brand).all()]

            return jsonify({
                'success': True,
                'data': {
                    'total': total,
                    'total_cars': total_cars,
                    'total_gundams': total_gundams,
                    'total_others': total_others,
                    'total_value': total_value,
                    'my_total': my_total,
                    'my_value': my_value,
                    'categories': categories_dict,
                    'available_categories': available_categories,
                    'top_brands': [{'brand': b[0], 'count': b[1]} for b in brand_counts],
                    'available_brands': all_brands,
                    'recent_models': [item.to_dict(current_user_id=current_user_id) for item in recent_items]
                }
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': f'Lỗi khi lấy thống kê: {str(e)}'}), 500

    # -------------------------------------------------------------------------
    # REST API: Collections Endpoints (Custom Libraries)
    # -------------------------------------------------------------------------
    @app.route('/api/collections', methods=['GET'])
    def get_my_collections():
        """Retrieve collections belonging to authenticated user."""
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập để xem thư viện của bạn.'}), 401

        collections = Collection.query.filter_by(owner_id=current_user_id).order_by(desc(Collection.created_at)).all()
        return jsonify({
            'success': True,
            'count': len(collections),
            'data': [c.to_dict(current_user_id=current_user_id) for c in collections]
        }), 200

    @app.route('/api/public/collections', methods=['GET'])
    def get_public_collections():
        """Retrieve public collections accessible to all users."""
        current_user_id = session.get('user_id')
        collections = Collection.query.filter_by(visibility='public').order_by(desc(Collection.created_at)).all()
        return jsonify({
            'success': True,
            'count': len(collections),
            'data': [c.to_dict(current_user_id=current_user_id) for c in collections]
        }), 200

    @app.route('/api/collections', methods=['POST'])
    def create_collection():
        """Create a new collection. Default visibility is strictly 'private'."""
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập để tạo thư viện.'}), 401

        data = request.get_json(silent=True) or {}
        name = (data.get('name') or '').strip()
        if not name:
            return jsonify({'success': False, 'message': 'Tên thư viện là bắt buộc.'}), 400

        description = (data.get('description') or '').strip()
        cover_image_url = (data.get('cover_image_url') or '').strip()
        visibility = (data.get('visibility') or 'private').strip().lower()
        if visibility not in ['private', 'public']:
            visibility = 'private'

        try:
            new_col = Collection(
                owner_id=current_user_id,
                name=name,
                description=description,
                cover_image_url=cover_image_url,
                visibility=visibility
            )
            db.session.add(new_col)
            db.session.commit()

            return jsonify({
                'success': True,
                'message': 'Đã tạo thư viện thành công!',
                'data': new_col.to_dict(current_user_id=current_user_id)
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Lỗi khi tạo thư viện: {str(e)}'}), 500

    @app.route('/api/collections/<int:col_id>', methods=['GET'])
    def get_collection(col_id):
        """
        Get collection details and items.
        Strict Privacy: Rejects unauthorized access to private collections (403 Forbidden).
        """
        current_user_id = session.get('user_id')
        col = db.session.get(Collection, col_id)
        if not col:
            return jsonify({'success': False, 'message': 'Không tìm thấy thư viện này.'}), 404

        # Privacy Enforcement: Private collections can only be viewed by owner
        if col.visibility == 'private' and col.owner_id != current_user_id:
            return jsonify({'success': False, 'message': 'Bạn không có quyền truy cập thư viện riêng tư này.'}), 403

        return jsonify({
            'success': True,
            'data': col.to_dict(current_user_id=current_user_id, include_models=True)
        }), 200

    @app.route('/api/collections/<int:col_id>', methods=['PUT'])
    def update_collection(col_id):
        """Update collection. Only owner can update."""
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập.'}), 401

        col = db.session.get(Collection, col_id)
        if not col:
            return jsonify({'success': False, 'message': 'Không tìm thấy thư viện.'}), 404

        if col.owner_id != current_user_id:
            return jsonify({'success': False, 'message': 'Bạn không có quyền chỉnh sửa thư viện này.'}), 403

        data = request.get_json(silent=True) or {}
        if 'name' in data:
            name = data.get('name', '').strip()
            if not name:
                return jsonify({'success': False, 'message': 'Tên thư viện không được để trống.'}), 400
            col.name = name

        if 'description' in data:
            col.description = data.get('description', '').strip()

        if 'cover_image_url' in data:
            col.cover_image_url = data.get('cover_image_url', '').strip()

        if 'visibility' in data:
            vis = data.get('visibility', '').strip().lower()
            if vis in ['public', 'private']:
                col.visibility = vis

        col.updated_at = datetime.now(timezone.utc)
        db.session.commit()

        return jsonify({
            'success': True,
            'message': 'Cập nhật thư viện thành công!',
            'data': col.to_dict(current_user_id=current_user_id)
        }), 200

    @app.route('/api/collections/<int:col_id>', methods=['DELETE'])
    def delete_collection(col_id):
        """Delete collection. Only owner can delete."""
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập.'}), 401

        col = db.session.get(Collection, col_id)
        if not col:
            return jsonify({'success': False, 'message': 'Không tìm thấy thư viện để xóa.'}), 404

        if col.owner_id != current_user_id:
            return jsonify({'success': False, 'message': 'Bạn không có quyền xóa thư viện này.'}), 403

        db.session.delete(col)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Đã xóa thư viện thành công.'}), 200

    @app.route('/api/collections/<int:col_id>/models', methods=['POST'])
    def add_model_to_collection(col_id):
        """Add model to collection. Only collection owner can manage items."""
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập.'}), 401

        col = db.session.get(Collection, col_id)
        if not col:
            return jsonify({'success': False, 'message': 'Không tìm thấy thư viện.'}), 404

        if col.owner_id != current_user_id:
            return jsonify({'success': False, 'message': 'Bạn không có quyền quản lý thư viện này.'}), 403

        data = request.get_json(silent=True) or {}
        model_id = data.get('model_id')
        if not model_id:
            return jsonify({'success': False, 'message': 'Thiếu model_id.'}), 400

        model = db.session.get(ModelItem, model_id)
        if not model:
            return jsonify({'success': False, 'message': 'Không tìm thấy mô hình.'}), 404

        # Check if already added
        exists = CollectionModel.query.filter_by(collection_id=col_id, model_id=model_id).first()
        if exists:
            return jsonify({'success': False, 'message': 'Mô hình này đã có trong thư viện.'}), 400

        cm = CollectionModel(collection_id=col_id, model_id=model_id)
        db.session.add(cm)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Đã thêm mô hình vào thư viện!'}), 201

    @app.route('/api/collections/<int:col_id>/models/<int:model_id>', methods=['DELETE'])
    def remove_model_from_collection(col_id, model_id):
        """Remove model from collection."""
        current_user_id = session.get('user_id')
        if not current_user_id:
            return jsonify({'success': False, 'message': 'Vui lòng đăng nhập.'}), 401

        col = db.session.get(Collection, col_id)
        if not col:
            return jsonify({'success': False, 'message': 'Không tìm thấy thư viện.'}), 404

        if col.owner_id != current_user_id:
            return jsonify({'success': False, 'message': 'Bạn không có quyền quản lý thư viện này.'}), 403

        cm = CollectionModel.query.filter_by(collection_id=col_id, model_id=model_id).first()
        if not cm:
            return jsonify({'success': False, 'message': 'Mô hình không có trong thư viện này.'}), 404

        db.session.delete(cm)
        db.session.commit()

        return jsonify({'success': True, 'message': 'Đã gỡ mô hình khỏi thư viện.'}), 200

    # -------------------------------------------------------------------------
    # Frontend SPA Route Serving
    # -------------------------------------------------------------------------
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        frontend_dir = os.path.join(os.path.dirname(Config.BASE_DIR), 'frontend')
        if path and os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)
        return send_from_directory(frontend_dir, 'index.html')

    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({'success': False, 'message': 'Kích thước ảnh vượt quá giới hạn (tối đa 5MB).'}), 413

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Tài nguyên không tồn tại.'}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'success': False, 'message': 'Lỗi máy chủ nội bộ.'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development').lower() == 'development'
    print(f"🚀 MyGarage Backend Server starting on http://127.0.0.1:{port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug)
