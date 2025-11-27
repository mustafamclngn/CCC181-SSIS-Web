from app.database import get_db
from werkzeug.security import generate_password_hash

class UserModel:
    @staticmethod
    def get_user_by_username(username):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT id, username, email, password FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            if user:
                return {
                    "id": user[0], 
                    "username": user[1],
                    "email": user[2],
                    "password": user[3]
                }
            return None
        finally:
            cursor.close()

    @staticmethod
    def check_username_exists(username):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM users WHERE username = %s", (username,))
            return cursor.fetchone()[0] > 0
        finally:
            cursor.close()

    @staticmethod
    def check_email_exists(email):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM users WHERE email = %s", (email,))
            return cursor.fetchone()[0] > 0
        finally:
            cursor.close()

    @staticmethod
    def create_user(username, email, password):
        db = get_db()
        cursor = db.cursor()
        try:
            hashed_password = generate_password_hash(password)
            cursor.execute(
                "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                (username, email, hashed_password)
            )
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()