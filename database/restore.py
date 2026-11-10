import os
import sys
import pymysql
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))

def restore_backup(backup_file="database/backup_mygarage_pre_upgrade.sql"):
    backup_path = os.path.join(BASE_DIR, backup_file)
    if not os.path.exists(backup_path):
        print(f"Error: Backup file {backup_path} does not exist.")
        return False

    with open(backup_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    host = os.getenv('DB_HOST', '127.0.0.1')
    port = int(os.getenv('DB_PORT', 3306))
    user = os.getenv('DB_USER', 'root')
    password = os.getenv('DB_PASSWORD', '')
    database = os.getenv('DB_NAME', 'mygarage_db')

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
        # Split by semicolon and execute non-empty statements
        statements = sql_content.split(';')
        for stmt in statements:
            stmt = stmt.strip()
            if stmt and not stmt.startswith('--'):
                cursor.execute(stmt)
        conn.commit()
        print("Database restored successfully from backup.")
        return True
    except Exception as e:
        conn.rollback()
        print(f"Restore failed: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    restore_backup()
