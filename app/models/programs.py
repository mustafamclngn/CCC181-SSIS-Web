from app.database import get_db
from psycopg2.extras import RealDictCursor

class ProgramModel:
    @staticmethod
    def get_all_colleges():
        db = get_db()
        cursor = db.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("""
                SELECT collegecode AS code, collegename AS name 
                FROM colleges 
                ORDER BY collegecode ASC
            """)
            colleges = cursor.fetchall()
            return [dict(row) for row in colleges]
        finally:
            cursor.close()
    
    @staticmethod
    def get_all_programs():
        db = get_db()
        cursor = db.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("""
                SELECT 
                    programcode AS code, 
                    programname AS name, 
                    collegecode AS college_code 
                FROM programs 
                ORDER BY programcode ASC
            """)
            programs = cursor.fetchall()
            return [dict(row) for row in programs]
        finally:
            cursor.close()
    
    @staticmethod
    def check_program_exists(code, name, original_code=None):
        db = get_db()
        cursor = db.cursor()
        try:
            if original_code:
                cursor.execute("""
                    SELECT EXISTS(
                        SELECT 1 FROM programs 
                        WHERE (programcode = %s OR programname = %s) 
                        AND programcode != %s
                    )
                """, (code, name, original_code))
            else:
                cursor.execute("""
                    SELECT EXISTS(
                        SELECT 1 FROM programs 
                        WHERE programcode = %s OR programname = %s
                    )
                """, (code, name))
            return cursor.fetchone()[0]
        finally:
            cursor.close()
    
    @staticmethod
    def create_program(code, name, college_code):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                "INSERT INTO programs (programcode, programname, collegecode) VALUES (%s, %s, %s)",
                (code, name, college_code)
            )
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()
    
    @staticmethod
    def update_program(original_code, new_code, new_name, new_college_code):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                """
                UPDATE programs
                SET programcode = %s,
                    programname = %s,
                    collegecode = %s
                WHERE programcode = %s
                """,
                (new_code, new_name, new_college_code, original_code)
            )
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()
    
    @staticmethod
    def delete_program(code):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("DELETE FROM programs WHERE programcode = %s", (code,))
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()