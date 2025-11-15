from app.database import get_db
from psycopg2.extras import RealDictCursor

class CollegeModel:
    @staticmethod
    def get_all_colleges():
        db = get_db()
        cursor = db.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("""
                SELECT collegecode, collegename 
                FROM colleges 
                ORDER BY collegecode ASC
            """)
            colleges = cursor.fetchall()
            return [dict(row) for row in colleges]
        finally:
            cursor.close()
    
    @staticmethod
    def check_college_exists(code, name, original_code=None):
        db = get_db()
        cursor = db.cursor()
        try:
            if original_code:
                cursor.execute("""
                    SELECT EXISTS(
                        SELECT 1 FROM colleges 
                        WHERE (collegecode = %s OR collegename = %s) 
                        AND collegecode != %s
                    )
                """, (code, name, original_code))
            else:
                cursor.execute("""
                    SELECT EXISTS(
                        SELECT 1 FROM colleges 
                        WHERE collegecode = %s OR collegename = %s
                    )
                """, (code, name))
            return cursor.fetchone()[0]
        finally:
            cursor.close()
    
    @staticmethod
    def create_college(code, name):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                "INSERT INTO colleges (collegecode, collegename) VALUES (%s, %s)",
                (code, name)
            )
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()
    
    @staticmethod
    def update_college(original_code, new_code, new_name):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                "UPDATE colleges SET collegecode = %s, collegename = %s WHERE collegecode = %s",
                (new_code, new_name, original_code)
            )
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()
    
    @staticmethod
    def delete_college(code):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("DELETE FROM colleges WHERE collegecode = %s", (code,))
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()