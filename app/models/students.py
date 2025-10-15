from app.database import get_db

class StudentModel:
    @staticmethod
    def get_all_programs():
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT programcode, programname FROM programs ORDER BY programcode ASC")
            programs_data = cursor.fetchall()
            return [{"code": p[0], "name": p[1]} for p in programs_data]
        finally:
            cursor.close()

    @staticmethod
    def get_all_students():
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("""
                SELECT idnumber, firstname, lastname, gender, yearlevel, programcode
                FROM students
                ORDER BY lastname, firstname
            """)
            students_data = cursor.fetchall()
            return [
                {
                    "id_number": s[0],
                    "first_name": s[1],
                    "last_name": s[2],
                    "gender": s[3],
                    "year_level": s[4],
                    "program_code": s[5],
                }
                for s in students_data
            ]
        finally:
            cursor.close()

    @staticmethod
    def check_student_exists(id_number, original_id=None):
        db = get_db()
        cursor = db.cursor()
        try:
            if original_id:
                cursor.execute(
                    "SELECT COUNT(*) FROM students WHERE idnumber = %s AND idnumber != %s",
                    (id_number, original_id)
                )
            else:
                cursor.execute(
                    "SELECT COUNT(*) FROM students WHERE idnumber = %s",
                    (id_number,)
                )
            return cursor.fetchone()[0] > 0
        finally:
            cursor.close()

    @staticmethod
    def create_student(id_number, first_name, last_name, gender, year_level, program_code):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO students (idnumber, firstname, lastname, gender, yearlevel, programcode)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (id_number, first_name, last_name, gender, year_level, program_code)
            )
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def update_student(original_id, new_id, new_first_name, new_last_name, new_gender, new_year_level, new_program_code):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                """
                UPDATE students
                SET idnumber = %s,
                    firstname = %s,
                    lastname = %s,
                    gender = %s,
                    yearlevel = %s,
                    programcode = %s
                WHERE idnumber = %s
                """,
                (new_id, new_first_name, new_last_name, new_gender, new_year_level, new_program_code, original_id)
            )
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def delete_student(id_number):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("DELETE FROM students WHERE idnumber = %s", (id_number,))
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()