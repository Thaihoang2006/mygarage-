import os
import pymysql
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))

def rollback_migration():
    host = os.getenv('DB_HOST', '127.0.0.1')
    port = int(os.getenv('DB_PORT', 3306))
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', 'mygarage_db')

    print(f"Connecting to MySQL ({host}:{port}) database '{database}' for rollback...")
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
        print("Dropping 'collection_models'...")
        cursor.execute("DROP TABLE IF EXISTS collection_models;")

        print("Dropping 'collections'...")
        cursor.execute("DROP TABLE IF EXISTS collections;")

        print("Removing foreign key and 'owner_id' from 'models'...")
        cursor.execute("DESCRIBE models;")
        columns = [row[0] for row in cursor.fetchall()]
        if 'owner_id' in columns:
            try:
                cursor.execute("ALTER TABLE models DROP FOREIGN KEY fk_models_owner;")
            except Exception as e:
                print(f"Notice dropping FK: {e}")
            try:
                cursor.execute("ALTER TABLE models DROP INDEX ix_models_owner_id;")
            except Exception as e:
                print(f"Notice dropping index: {e}")
            cursor.execute("ALTER TABLE models DROP COLUMN owner_id;")

        print("Dropping 'users'...")
        cursor.execute("DROP TABLE IF EXISTS users;")

        conn.commit()
        print("Rollback v2 completed successfully.")
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error during rollback: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    rollback_migration()
