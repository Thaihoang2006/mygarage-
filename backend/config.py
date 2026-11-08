import os
import urllib.parse
from dotenv import load_dotenv

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Load .env file from backend directory or project root
load_dotenv(os.path.join(BASE_DIR, '.env'))
load_dotenv(os.path.join(os.path.dirname(BASE_DIR), '.env'))

class Config:
    """Base application configuration loaded from environment variables."""
    BASE_DIR = BASE_DIR
    SECRET_KEY = os.getenv('SECRET_KEY', 'mygarage-secret-key-2026')
    
    # Server configuration
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('FLASK_ENV', 'development').lower() == 'development'
    
    # Database configuration
    DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
    DB_PORT = int(os.getenv('DB_PORT', 3306))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'mygarage_db')
    
    # Determine Database URI
    database_url_env = os.getenv('DATABASE_URL')
    
    if database_url_env:
        SQLALCHEMY_DATABASE_URI = database_url_env
        IS_MYSQL = 'mysql' in database_url_env
    elif DB_PASSWORD and DB_PASSWORD != 'your_mysql_password_here':
        # Safely quote password for MySQL connection
        _encoded_pwd = urllib.parse.quote_plus(DB_PASSWORD)
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{DB_USER}:{_encoded_pwd}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
        )
        IS_MYSQL = True
    else:
        # Development fallback to SQLite so frontend and CRUD can run immediately
        # until the user enters their MySQL root password in backend/.env
        sqlite_path = os.path.join(BASE_DIR, 'mygarage_local.db')
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{sqlite_path}"
        IS_MYSQL = False
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Engine pool configuration (only applied to MySQL)
    if IS_MYSQL:
        SQLALCHEMY_ENGINE_OPTIONS = {
            'pool_recycle': 280,
            'pool_pre_ping': True,
            'pool_size': 10,
            'max_overflow': 20
        }
    else:
        SQLALCHEMY_ENGINE_OPTIONS = {}

    # File upload settings
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', os.path.join(BASE_DIR, 'uploads'))
    if not os.path.isabs(UPLOAD_FOLDER):
        UPLOAD_FOLDER = os.path.join(BASE_DIR, UPLOAD_FOLDER)
        
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 5 * 1024 * 1024))  # 5MB
    ALLOWED_EXTENSIONS = set(os.getenv('ALLOWED_EXTENSIONS', 'jpg,jpeg,png,webp').lower().split(','))
