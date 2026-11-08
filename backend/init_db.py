"""
Database Setup & Migration Script for MyGarage.
Connects to MySQL, creates 'mygarage_db' if it does not exist,
creates the 'models' table, and inserts seed data if empty.
"""
import os
import pymysql
from config import Config
from app import create_app
from models import db, ModelItem

def ensure_database_exists():
    """Connect to MySQL without specifying a DB to create the database if needed."""
    host = Config.DB_HOST
    port = Config.DB_PORT
    user = Config.DB_USER
    password = Config.DB_PASSWORD
    db_name = Config.DB_NAME

    print(f"Connecting to MySQL at {host}:{port} as user '{user}'...")
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        with conn.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
            print(f" Database `{db_name}` is ready.")
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f" Error connecting to MySQL: {e}")
        return False

def initialize_tables_and_seeds():
    """Create tables using SQLAlchemy and run seed data."""
    app = create_app()
    with app.app_context():
        try:
            db.create_all()
            print(" Tables verified / created successfully.")
            count = ModelItem.query.count()
            print(f" Current model count in database: {count}")
            return True
        except Exception as e:
            print(f" Error creating tables: {e}")
            return False

if __name__ == '__main__':
    print("=" * 60)
    print("MYGARAGE DATABASE INITIALIZATION")
    print("=" * 60)
    if ensure_database_exists():
        if initialize_tables_and_seeds():
            print(" Database initialization completed successfully!")
        else:
            print(" Table initialization failed.")
    else:
        print(" Could not connect to MySQL. Please check backend/.env credentials.")
