"""
Rollback Script for Migration v3.
Reverts collection_votes table and cover_url column if needed.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import pymysql
from config import Config

def rollback_migration():
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
        print("Dropping 'collection_votes' table if exists...")
        cursor.execute("DROP TABLE IF EXISTS collection_votes;")
        print(" 'collection_votes' dropped.")

        # Check and drop cover_url
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = %s AND TABLE_NAME = 'users' AND COLUMN_NAME = 'cover_url';
        """, (Config.DB_NAME,))
        res = cursor.fetchone()
        if res['count'] > 0:
            print("Dropping 'cover_url' from 'users'...")
            cursor.execute("ALTER TABLE users DROP COLUMN cover_url;")
            print(" Dropped 'cover_url' column.")

        conn.commit()
        print(" Rollback v3 completed successfully.")
        return True
    except Exception as e:
        conn.rollback()
        print(f"❌ Error during Rollback v3: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    rollback_migration()
