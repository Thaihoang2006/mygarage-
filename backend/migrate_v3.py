"""
Database Migration v3: Community, Profile Cover Banner, and Collection Votes.
Non-destructive: Preserves 100% of existing accounts, models, and collections.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pymysql
from config import Config

def run_migration():
    print(f"Connecting to MySQL at {Config.DB_HOST}:{Config.DB_PORT}, database: {Config.DB_NAME}...")
    conn = pymysql.connect(
        host=Config.DB_HOST,
        port=Config.DB_PORT,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        charset='utf8mb4',
        cursorclass=pymysql.cursors.DictCursor
    )
    cursor = conn.cursor()
    try:
        # 1. Check if cover_url exists in users
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'users' AND COLUMN_NAME = 'cover_url';
        """, (Config.DB_NAME,))
        res = cursor.fetchone()
        if res['count'] == 0:
            print("Adding 'cover_url' column to 'users' table...")
            cursor.execute("ALTER TABLE users ADD COLUMN cover_url VARCHAR(255) NULL AFTER avatar_url;")
            print(" Added 'cover_url' column.")
        else:
            print(" Column 'cover_url' already exists in 'users'.")

        # 2. Create collection_votes table
        print("Ensuring 'collection_votes' table exists...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS collection_votes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                collection_id INT NOT NULL,
                user_id INT NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_cv_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
                CONSTRAINT fk_cv_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                CONSTRAINT uq_col_user UNIQUE (collection_id, user_id),
                INDEX idx_cv_collection (collection_id),
                INDEX idx_cv_user (user_id),
                INDEX idx_cv_created_at (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)
        print(" 'collection_votes' table is ready.")

        conn.commit()

        # 3. Verification of data counts
        cursor.execute("SELECT COUNT(*) as cnt FROM users;")
        user_cnt = cursor.fetchone()['cnt']
        cursor.execute("SELECT COUNT(*) as cnt FROM models;")
        model_cnt = cursor.fetchone()['cnt']
        cursor.execute("SELECT COUNT(*) as cnt FROM collections;")
        col_cnt = cursor.fetchone()['cnt']

        print("\n Migration v3 completed successfully!")
        print(f"  Verified Users count: {user_cnt}")
        print(f"  Verified Models count: {model_cnt}")
        print(f"  Verified Collections count: {col_cnt}")

        return True
    except Exception as e:
        conn.rollback()
        print(f"❌ Error during Migration v3: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    run_migration()
