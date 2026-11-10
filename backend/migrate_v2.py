import os
import sys
import pymysql
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))

def run_migration():
    host = os.getenv('DB_HOST', '127.0.0.1')
    port = int(os.getenv('DB_PORT', 3306))
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', 'mygarage_db')

    print(f"Connecting to MySQL ({host}:{port}) database '{database}'...")
    conn = pymysql.connect(
        host=host,
        port=port,
        user=user,
        password=password,
        database=database,
        charset='utf8mb4'
    )
    cursor = conn.cursor()

    try:
        # 1. Create table 'users' if not exists
        print("Checking table 'users'...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(120) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                display_name VARCHAR(100) NULL,
                avatar_url VARCHAR(255) NULL,
                bio TEXT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX ix_users_username (username),
                INDEX ix_users_email (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        print("-> Table 'users' verified / created.")

        # 2. Add 'owner_id' column to 'models' if not exists
        cursor.execute("DESCRIBE models;")
        columns = [row[0] for row in cursor.fetchall()]
        if 'owner_id' not in columns:
            print("Adding 'owner_id' column to 'models'...")
            cursor.execute("""
                ALTER TABLE models 
                ADD COLUMN owner_id INT NULL AFTER id;
            """)
            cursor.execute("""
                ALTER TABLE models 
                ADD CONSTRAINT fk_models_owner FOREIGN KEY (owner_id) 
                REFERENCES users(id) ON DELETE SET NULL;
            """)
            cursor.execute("""
                ALTER TABLE models 
                ADD INDEX ix_models_owner_id (owner_id);
            """)
            print("-> Column 'owner_id' and foreign key added to 'models'.")
        else:
            print("-> Column 'owner_id' already exists in 'models'.")

        # 3. Create table 'collections' if not exists (default visibility = 'private')
        print("Checking table 'collections'...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS collections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                owner_id INT NOT NULL,
                name VARCHAR(150) NOT NULL,
                description TEXT NULL,
                cover_image_url TEXT NULL,
                visibility VARCHAR(20) NOT NULL DEFAULT 'private',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                CONSTRAINT fk_collections_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX ix_collections_owner_id (owner_id),
                INDEX ix_collections_visibility (visibility)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        print("-> Table 'collections' verified / created (default visibility: 'private').")

        # 4. Create table 'collection_models' if not exists
        print("Checking table 'collection_models'...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS collection_models (
                collection_id INT NOT NULL,
                model_id INT NOT NULL,
                added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (collection_id, model_id),
                CONSTRAINT fk_cm_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                CONSTRAINT fk_cm_model FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        print("-> Table 'collection_models' verified / created.")

        conn.commit()
        print("Migration v2 completed successfully with zero data loss!")
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error during migration: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    run_migration()
