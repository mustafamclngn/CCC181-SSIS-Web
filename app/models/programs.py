from app.database import get_db

class ProgramModel:
    @staticmethod
    def get_all_colleges():
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT collegecode, collegename FROM colleges ORDER BY collegecode ASC")
            colleges_data = cursor.fetchall()
            return [{"code": c[0], "name": c[1]} for c in colleges_data]
        finally:
            cursor.close()
    
    @staticmethod
    def get_all_programs():
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT programcode, programname, collegecode FROM programs ORDER BY programcode ASC")
            programs_data = cursor.fetchall()
            return [{"code": p[0], "name": p[1], "college_code": p[2]} for p in programs_data]
        finally:
            cursor.close()
    
    @staticmethod
    def check_program_exists(code, name, original_code=None):
        db = get_db()
        cursor = db.cursor()
        try:
            if original_code:
                cursor.execute(
                    "SELECT COUNT(*) FROM programs WHERE (programcode = %s OR programname = %s) AND programcode != %s",
                    (code, name, original_code)
                )
            else:
                cursor.execute(
                    "SELECT COUNT(*) FROM programs WHERE programcode = %s OR programname = %s",
                    (code, name)
                )
            return cursor.fetchone()[0] > 0
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