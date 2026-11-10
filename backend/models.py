from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

def utc_now():
    return datetime.now(timezone.utc)

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(50), nullable=False, unique=True, index=True)
    email = db.Column(db.String(120), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(100), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    bio = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    def set_password(self, password):
        """Hash password securely using werkzeug.security."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify password against stored hash."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """Serialize user object without sensitive fields."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'display_name': self.display_name or self.username,
            'avatar_url': self.avatar_url or '',
            'bio': self.bio or '',
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

    def __repr__(self):
        return f"<User {self.id}: {self.username}>"


class ModelItem(db.Model):
    __tablename__ = 'models'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(50), nullable=False, default='Car', index=True)
    brand = db.Column(db.String(100), nullable=True, index=True)
    scale = db.Column(db.String(50), nullable=True)
    price = db.Column(db.Numeric(12, 2), nullable=True)
    purchase_date = db.Column(db.Date, nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now, index=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    owner = db.relationship('User', backref=db.backref('models', lazy=True))

    def to_dict(self, current_user_id=None):
        """
        Serialize ModelItem object into clean JSON dictionary.
        Strict Privacy: Hides sensitive fields (price, purchase_date) if viewer is not the owner.
        """
        is_owner = (current_user_id is not None and self.owner_id is not None and self.owner_id == current_user_id)

        data = {
            'id': self.id,
            'owner_id': self.owner_id,
            'owner_name': (self.owner.display_name or self.owner.username) if self.owner else None,
            'is_owner': is_owner,
            'name': self.name,
            'category': self.category or 'Other',
            'brand': self.brand or '',
            'scale': self.scale or '',
            'price': float(self.price) if self.price is not None else None,
            'purchase_date': self.purchase_date.strftime('%Y-%m-%d') if self.purchase_date else None,
            'image_url': self.image_url or '',
            'description': self.description or '',
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }

        return data

    def __repr__(self):
        return f"<ModelItem {self.id}: {self.name} ({self.brand} - {self.category})>"


class CollectionModel(db.Model):
    __tablename__ = 'collection_models'

    collection_id = db.Column(db.Integer, db.ForeignKey('collections.id', ondelete='CASCADE'), primary_key=True)
    model_id = db.Column(db.Integer, db.ForeignKey('models.id', ondelete='CASCADE'), primary_key=True)
    added_at = db.Column(db.DateTime, nullable=False, default=utc_now)


class Collection(db.Model):
    __tablename__ = 'collections'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    cover_image_url = db.Column(db.Text, nullable=True)
    visibility = db.Column(db.String(20), nullable=False, default='private', index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    owner = db.relationship('User', backref=db.backref('collections', lazy=True))
    models = db.relationship('ModelItem', secondary='collection_models', backref=db.backref('in_collections', lazy='dynamic'))

    def to_dict(self, current_user_id=None, include_models=False):
        """Serialize Collection object."""
        is_owner = (current_user_id is not None and self.owner_id == current_user_id)
        data = {
            'id': self.id,
            'owner_id': self.owner_id,
            'owner_name': (self.owner.display_name or self.owner.username) if self.owner else None,
            'is_owner': is_owner,
            'name': self.name,
            'description': self.description or '',
            'cover_image_url': self.cover_image_url or '',
            'visibility': self.visibility,
            'model_count': len(self.models),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }

        if include_models:
            data['models'] = [m.to_dict(current_user_id=current_user_id) for m in self.models]

        return data

    def __repr__(self):
        return f"<Collection {self.id}: {self.name} ({self.visibility})>"
