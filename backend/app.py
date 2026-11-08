import os
import uuid
from datetime import datetime, timezone
from PIL import Image
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sqlalchemy import or_, desc, asc, func

from config import Config
from models import db, ModelItem

def create_app():
    app = Flask(
        __name__,
        static_folder=os.path.join(os.path.dirname(Config.BASE_DIR), 'frontend'),
        static_url_path=''
    )
    app.config.from_object(Config)

    # Enable CORS for all routes (allows frontend to call API from any host/port)
    CORS(app, resources={r"/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Helper: Validate and save uploaded image
    def handle_image_upload(file_storage):
        if not file_storage or file_storage.filename == '':
            return None, None

        filename = file_storage.filename
        ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
        if ext not in app.config['ALLOWED_EXTENSIONS']:
            return None, f"Định dạng ảnh không hợp lệ (chỉ hỗ trợ {', '.join(app.config['ALLOWED_EXTENSIONS'])})."

        # Generate unique, collision-proof filename
        unique_filename = f"{uuid.uuid4().hex}.{ext}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)

        # Validate file content using Pillow
        try:
            image = Image.open(file_storage.stream)
            image.verify()  # verify integrity
            # Reset file pointer after verify
            file_storage.stream.seek(0)
            file_storage.save(save_path)
            return f"/uploads/{unique_filename}", None
        except Exception as e:
            return None, f"Tập tin không phải là ảnh hợp lệ hoặc bị lỗi: {str(e)}"

    # Helper: Delete uploaded file if it was stored locally
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

    # Helper: Seed initial sample data if DB is empty
    def seed_initial_data():
        try:
            if ModelItem.query.count() == 0:
                sample_items = [
                    ModelItem(
                        name='Nissan Skyline GT-R (R34) V-Spec II Bayside Blue',
                        category='Car',
                        brand='Mini GT',
                        scale='1/64',
                        price=350000.00,
                        purchase_date=datetime.strptime('2026-03-15', '%Y-%m-%d').date(),
                        image_url='https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
                        description='Mô hình hợp kim đúc die-cast chi tiết cao, màu xanh Bayside Blue huyền thoại với mâm BBS vàng đồng đặc trưng.'
                    ),
                    ModelItem(
                        name='Porsche 911 GT3 RS (992) Weissach Package',
                        category='Car',
                        brand='Hot Wheels',
                        scale='1/64',
                        price=120000.00,
                        purchase_date=datetime.strptime('2026-04-02', '%Y-%m-%d').date(),
                        image_url='https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
                        description='Phiên bản Premium Boulevard Series với bánh cao su Real Riders, chi tiết cánh gió khí động học sợi carbon ấn tượng.'
                    ),
                    ModelItem(
                        name='Toyota Century Royal Black',
                        category='Car',
                        brand='Tomica Limited Vintage',
                        scale='1/64',
                        price=780000.00,
                        purchase_date=datetime.strptime('2026-05-20', '%Y-%m-%d').date(),
                        image_url='https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
                        description='Dòng xe biểu tượng quyền lực Nhật Bản từ TLV-NEO. Nước sơn đen bóng sâu, chi tiết rèm che và nội thất nhung tái hiện tỉ mỉ.'
                    ),
                    ModelItem(
                        name='RX-78-2 Gundam Ver.Ka',
                        category='Gundam',
                        brand='Bandai',
                        scale='MG 1/100',
                        price=950000.00,
                        purchase_date=datetime.strptime('2026-06-10', '%Y-%m-%d').date(),
                        image_url='https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
                        description='Bộ kit Master Grade thiết kế bởi Katoki Hajime. Khung xương inner-frame kim loại kết hợp decal nước sắc nét.'
                    ),
                    ModelItem(
                        name='Gundam Barbatos Lupus Rex',
                        category='Gundam',
                        brand='Bandai',
                        scale='HG 1/144',
                        price=380000.00,
                        purchase_date=datetime.strptime('2026-07-01', '%Y-%m-%d').date(),
                        image_url='https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
                        description='Mô hình Barbatos dạng vuốt thú dã chiến từ series Iron-Blooded Orphans. Đã lót panel line và sơn viền móng vuốt vàng.'
                    ),
                    ModelItem(
                        name='Mazinger Z Infinity Ver.',
                        category='Other',
                        brand='Bandai Spirits',
                        scale='HG 1/144',
                        price=820000.00,
                        purchase_date=datetime.strptime('2026-08-14', '%Y-%m-%d').date(),
                        image_url='https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
                        description='Siêu robot biểu tượng Nhật Bản trong phim điện ảnh Mazinger Z: Infinity. Khớp biên độ rộng, Rocket Punch linh hoạt.'
                    )
                ]
                db.session.add_all(sample_items)
                db.session.commit()
                app.logger.info("Sample seed data inserted successfully.")
        except Exception as e:
            app.logger.warning(f"Seed data skipped or failed: {str(e)}")

    # Try creating tables and seeding on app creation
    with app.app_context():
        try:
            db.create_all()
            seed_initial_data()
        except Exception as e:
            app.logger.warning(f"Database connection not ready on startup: {str(e)}")

    # -------------------------------------------------------------------------
    # Authentication Endpoints
    # -------------------------------------------------------------------------
    @app.route('/api/auth/login', methods=['POST'])
    def auth_login():
        """Handle login authentication."""
        data = request.get_json(silent=True) or {}
        username = (data.get('username') or '').strip()
        password = (data.get('password') or '').strip()

        if not username or not password:
            return jsonify({'success': False, 'message': 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.'}), 400

        # Standard admin account credentials for demo & evaluation
        valid_users = {
            'admin': {'password': 'garage2026', 'name': 'Thái Hoàng', 'role': 'Quản trị viên'},
            'thaihoang': {'password': 'garage2026', 'name': 'Thái Hoàng', 'role': 'Chủ Garage'}
        }

        # Accept valid users or accept any demo login if password is 'garage2026' or 'admin'
        if username in valid_users and valid_users[username]['password'] == password:
            user_info = valid_users[username]
            user_info['username'] = username
        elif password in ['garage2026', 'admin', 'password']:
            user_info = {
                'username': username,
                'name': username.capitalize(),
                'role': 'Thành viên Garage'
            }
        else:
            return jsonify({'success': False, 'message': 'Sai tên đăng nhập hoặc mật khẩu! (Gợi ý demo: admin / garage2026)'}), 401

        # Return session token and user info
        token = f"mygarage-token-{uuid.uuid4().hex}"
        return jsonify({
            'success': True,
            'message': f'Xin chào {user_info["name"]}, đăng nhập thành công!',
            'token': token,
            'user': user_info
        }), 200

    @app.route('/api/auth/logout', methods=['POST'])
    def auth_logout():
        """Handle logout."""
        return jsonify({'success': True, 'message': 'Đã đăng xuất an toàn.'}), 200

    @app.route('/api/auth/me', methods=['GET'])
    def auth_me():
        """Retrieve current authenticated user profile."""
        auth_header = request.headers.get('Authorization', '')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'success': False, 'message': 'Chưa đăng nhập'}), 401
        return jsonify({
            'success': True,
            'user': {
                'username': 'admin',
                'name': 'Thái Hoàng',
                'role': 'Quản trị viên'
            }
        }), 200

    # -------------------------------------------------------------------------
    # System & Health Check Endpoints
    # -------------------------------------------------------------------------
    @app.route('/healthz', methods=['GET'])
    def healthz():
        """Liveness probe: verifies the backend application process is running."""
        return jsonify({'status': 'ok', 'timestamp': datetime.now(timezone.utc).isoformat()}), 200

    @app.route('/readyz', methods=['GET'])
    def readyz():
        """Readiness probe: verifies backend can serve traffic, including database connectivity."""
        try:
            # Execute simple ping query
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
        """Serve uploaded image files safely."""
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # -------------------------------------------------------------------------
    # REST API: Models Endpoints
    # -------------------------------------------------------------------------
    @app.route('/api/models', methods=['GET'])
    def get_models():
        """Retrieve list of models with optional search, category, brand, and sort."""
        try:
            query = ModelItem.query
            search = request.args.get('search', '').strip()
            category = request.args.get('category', '').strip()
            brand = request.args.get('brand', '').strip()
            sort = request.args.get('sort', 'newest').strip()

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
            else:  # newest default
                query = query.order_by(desc(ModelItem.created_at))

            items = query.all()
            return jsonify({
                'success': True,
                'count': len(items),
                'data': [item.to_dict() for item in items]
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': f'Lỗi khi tải danh sách mô hình: {str(e)}'}), 500

    @app.route('/api/models/<int:model_id>', methods=['GET'])
    def get_model(model_id):
        """Retrieve single model details by ID."""
        item = db.session.get(ModelItem, model_id)
        if not item:
            return jsonify({'success': False, 'message': 'Không tìm thấy mô hình với ID này.'}), 404
        return jsonify({'success': True, 'data': item.to_dict()}), 200

    @app.route('/api/models', methods=['POST'])
    def create_model():
        """Create a new model item. Supports JSON and multipart/form-data with file upload."""
        try:
            # Handle either form-data or JSON payload
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
            if category not in ['Car', 'Gundam', 'Other']:
                category = 'Other'

            brand = (data.get('brand') or '').strip()
            scale = (data.get('scale') or '').strip()
            description = (data.get('description') or '').strip()

            # Parse price
            raw_price = data.get('price')
            price = None
            if raw_price is not None and str(raw_price).strip() != '':
                try:
                    price = float(raw_price)
                except ValueError:
                    return jsonify({'success': False, 'message': 'Giá mua phải là con số hợp lệ.'}), 400

            # Parse purchase_date
            raw_date = data.get('purchase_date')
            purchase_date = None
            if raw_date and str(raw_date).strip() != '':
                try:
                    purchase_date = datetime.strptime(str(raw_date).strip(), '%Y-%m-%d').date()
                except ValueError:
                    return jsonify({'success': False, 'message': 'Định dạng ngày mua không đúng (YYYY-MM-DD).'}), 400

            # Process image (uploaded file takes precedence over image_url string)
            image_url = (data.get('image_url') or '').strip()
            if file_storage:
                uploaded_path, err = handle_image_upload(file_storage)
                if err:
                    return jsonify({'success': False, 'message': err}), 400
                if uploaded_path:
                    image_url = uploaded_path

            new_item = ModelItem(
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
                'data': new_item.to_dict()
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Lỗi khi thêm mô hình: {str(e)}'}), 500

    @app.route('/api/models/<int:model_id>', methods=['PUT'])
    def update_model(model_id):
        """Update existing model item. Supports JSON and multipart/form-data."""
        try:
            item = db.session.get(ModelItem, model_id)
            if not item:
                return jsonify({'success': False, 'message': 'Không tìm thấy mô hình cần sửa.'}), 404

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
                if category in ['Car', 'Gundam', 'Other']:
                    item.category = category

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

            # Handle new image upload or URL change
            if file_storage:
                uploaded_path, err = handle_image_upload(file_storage)
                if err:
                    return jsonify({'success': False, 'message': err}), 400
                if uploaded_path:
                    # Clean up old local image if different
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
                'data': item.to_dict()
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Lỗi khi cập nhật mô hình: {str(e)}'}), 500

    @app.route('/api/models/<int:model_id>', methods=['DELETE'])
    def delete_model(model_id):
        """Delete model by ID and clean up local image file."""
        try:
            item = db.session.get(ModelItem, model_id)
            if not item:
                return jsonify({'success': False, 'message': 'Không tìm thấy mô hình để xóa.'}), 404

            # Clean up local image file if present
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
            total = ModelItem.query.count()
            total_cars = ModelItem.query.filter_by(category='Car').count()
            total_gundams = ModelItem.query.filter_by(category='Gundam').count()
            total_others = ModelItem.query.filter_by(category='Other').count()

            # Total collection purchase value
            total_val_res = db.session.query(func.sum(ModelItem.price)).scalar()
            total_value = float(total_val_res) if total_val_res is not None else 0.0

            # Brand breakdown
            brand_counts = db.session.query(
                ModelItem.brand,
                func.count(ModelItem.id)
            ).filter(ModelItem.brand != None, ModelItem.brand != '').group_by(ModelItem.brand).order_by(desc(func.count(ModelItem.id))).limit(8).all()

            # Recent 5 models
            recent_items = ModelItem.query.order_by(desc(ModelItem.created_at)).limit(5).all()

            # Distinct list of brands for filtering
            all_brands = [b[0] for b in db.session.query(ModelItem.brand).filter(ModelItem.brand != None, ModelItem.brand != '').distinct().order_by(ModelItem.brand).all()]

            return jsonify({
                'success': True,
                'data': {
                    'total': total,
                    'total_cars': total_cars,
                    'total_gundams': total_gundams,
                    'total_others': total_others,
                    'total_value': total_value,
                    'categories': {
                        'Car': total_cars,
                        'Gundam': total_gundams,
                        'Other': total_others
                    },
                    'top_brands': [{'brand': b[0], 'count': b[1]} for b in brand_counts],
                    'available_brands': all_brands,
                    'recent_models': [item.to_dict() for item in recent_items]
                }
            }), 200
        except Exception as e:
            return jsonify({'success': False, 'message': f'Lỗi khi lấy thống kê: {str(e)}'}), 500

    # -------------------------------------------------------------------------
    # Frontend SPA Route Serving
    # -------------------------------------------------------------------------
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        """Serve frontend static files (HTML, CSS, JS) or fallback to index.html."""
        frontend_dir = os.path.join(os.path.dirname(Config.BASE_DIR), 'frontend')
        if path and os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)
        return send_from_directory(frontend_dir, 'index.html')

    # Error Handlers
    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({'success': False, 'message': 'Kích thước ảnh vượt quá giới hạn cho phép (tối đa 5MB).'}), 413

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
