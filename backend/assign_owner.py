import os
import sys
import pymysql
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, 'backend', '.env'))

def list_users():
    """List all registered users from MySQL."""
    conn = pymysql.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'mygarage_db'),
        charset='utf8mb4'
    )
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    try:
        cursor.execute("SELECT id, username, email, display_name, created_at FROM users ORDER BY id ASC;")
        users = cursor.fetchall()
        return users
    finally:
        cursor.close()
        conn.close()

def assign_model_owner(model_id, user_id):
    """Assign a model to a specified user_id."""
    conn = pymysql.connect(
        host=os.getenv('DB_HOST', '127.0.0.1'),
        port=int(os.getenv('DB_PORT', 3306)),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', ''),
        database=os.getenv('DB_NAME', 'mygarage_db'),
        charset='utf8mb4'
    )
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, name FROM models WHERE id = %s;", (model_id,))
        model = cursor.fetchone()
        if not model:
            print(f"Error: Model ID {model_id} not found.")
            return False

        cursor.execute("SELECT id, username FROM users WHERE id = %s;", (user_id,))
        user = cursor.fetchone()
        if not user:
            print(f"Error: User ID {user_id} not found.")
            return False

        cursor.execute("UPDATE models SET owner_id = %s WHERE id = %s;", (user_id, model_id))
        conn.commit()
        print(f"Successfully assigned model '{model[1]}' (ID: {model_id}) to user '{user[1]}' (ID: {user_id}).")
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error assigning owner: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    if len(sys.argv) == 3:
        m_id = int(sys.argv[1])
        u_id = int(sys.argv[2])
        assign_model_owner(m_id, u_id)
    else:
        print("Registered Users in Database:")
        users = list_users()
        if not users:
            print("  (No users registered yet)")
        for u in users:
            print(f"  - ID: {u['id']} | Username: {u['username']} | Email: {u['email']} | Display Name: {u['display_name']}")
