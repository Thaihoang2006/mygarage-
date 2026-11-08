from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def utc_now():
    return datetime.now(timezone.utc)

class ModelItem(db.Model):
    __tablename__ = 'models'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
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

    def to_dict(self):
        """Serialize ModelItem object into clean JSON dictionary."""
        return {
            'id': self.id,
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

    def __repr__(self):
        return f"<ModelItem {self.id}: {self.name} ({self.brand} - {self.category})>"
