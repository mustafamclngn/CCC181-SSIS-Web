from app.database import get_db
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

@contextmanager
def db_cursor():
    db = get_db()
    cursor = db.cursor(cursor_factory=RealDictCursor)
    try:
        yield cursor
    except Exception as e:
        db.rollback()
        raise e
    finally:
        cursor.close()

class StudentModel:
    SEARCH_COLUMNS = [
        "s.idnumber",
        "s.firstname",
        "s.lastname",
        "s.programcode",
        "s.yearlevel::text",
        "s.gender",
        "p.programname",
        "c.collegename"
    ]

    SORT_MAP = {
        0: 'imageurl',
        1: 's.idnumber',
        2: 's.firstname',
        3: 's.lastname',
        4: 's.programcode',
        5: 's.yearlevel',
        6: 's.gender',
        7: 'actions',
    }

    @staticmethod
    def get_all_students(start, length, draw, search_value, order_column, order_dir, filter_gender, filter_year, filter_program):
        with db_cursor() as cursor:
            
            base_joins = """
                FROM students s
                LEFT JOIN programs p ON s.programcode = p.programcode
                LEFT JOIN colleges c ON p.collegecode = c.collegecode
            """
            
            where_clauses = []
            params = {}

            if search_value:
                or_conditions = [f"{col} ILIKE %(search_value)s" for col in StudentModel.SEARCH_COLUMNS]
                
                where_clauses.append(f"({' OR '.join(or_conditions)})")
                params['search_value'] = f'%{search_value}%'

            if filter_gender:
                where_clauses.append("s.gender = %(filter_gender)s")
                params['filter_gender'] = filter_gender
            
            if filter_year:
                where_clauses.append("s.yearlevel = %(filter_year)s")
                params['filter_year'] = filter_year
                
            if filter_program:
                where_clauses.append("s.programcode = %(filter_program)s")
                params['filter_program'] = filter_program
            
            where_sql = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""

            cursor.execute("SELECT COUNT(*) AS total FROM students s")
            total_records = cursor.fetchone()['total']

            cursor.execute(f"SELECT COUNT(*) AS filtered_total {base_joins} {where_sql}", params)
            total_filtered = cursor.fetchone()['filtered_total']

            order_by = 's.lastname ASC, s.firstname ASC'
            
            if order_column in StudentModel.SORT_MAP:
                col_name = StudentModel.SORT_MAP[order_column]
                if col_name not in ['imageurl', 'actions']: 
                    order_by = f"{col_name} {order_dir}"
            
            data_query = f"""
                SELECT 
                    s.idnumber, s.firstname, s.lastname, s.gender, s.yearlevel, 
                    s.programcode, s.imageurl, p.programname, c.collegecode, c.collegename
                {base_joins}
                {where_sql}
                ORDER BY {order_by}
                LIMIT %(limit)s OFFSET %(offset)s
            """
            
            params['limit'] = length
            params['offset'] = start
            
            cursor.execute(data_query, params)
            students_data = cursor.fetchall()
            
            formatted_data = [
                {
                    "id_number": s['idnumber'],
                    "first_name": s['firstname'],
                    "last_name": s['lastname'],
                    "gender": s['gender'],
                    "year_level": s['yearlevel'],
                    "program_code": s['programcode'],
                    "image_url": s['imageurl'],
                    "programname": s['programname'],
                    "collegecode": s['collegecode'],
                    "collegename": s['collegename']
                }
                for s in students_data
            ]
            
            return {
                "draw": draw,
                "recordsTotal": total_records,
                "recordsFiltered": total_filtered,
                "data": formatted_data
            }

    @staticmethod
    def get_student_by_id(id_number):
        with db_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    s.idnumber, s.firstname, s.lastname, s.gender, s.yearlevel, 
                    s.programcode, s.imageurl, p.programname, c.collegecode, c.collegename
                FROM students s
                LEFT JOIN programs p ON s.programcode = p.programcode
                LEFT JOIN colleges c ON p.collegecode = c.collegecode
                WHERE s.idnumber = %s
            """, (id_number,))
            
            student_data = cursor.fetchone()
            
            if student_data:
                return {
                    "id_number": student_data['idnumber'],
                    "first_name": student_data['firstname'],
                    "last_name": student_data['lastname'],
                    "gender": student_data['gender'],
                    "year_level": student_data['yearlevel'],
                    "program_code": student_data['programcode'],
                    "image_url": student_data['imageurl'],
                    "programname": student_data['programname'],
                    "collegecode": student_data['collegecode'],
                    "collegename": student_data['collegename']
                }
            return None

    @staticmethod
    def get_all_programs():
        with db_cursor() as cursor:
            cursor.execute("""
                SELECT programcode AS code, programname AS name 
                FROM programs 
                ORDER BY programcode ASC
            """)
            return [dict(row) for row in cursor.fetchall()]

    @staticmethod
    def check_student_exists(id_number, original_id=None):
        with db_cursor() as cursor:
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
            return cursor.fetchone()['count'] > 0

    @staticmethod
    def create_student(id_number, first_name, last_name, gender, year_level, program_code, image_url=None):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute(
                """
                INSERT INTO students (idnumber, firstname, lastname, gender, yearlevel, programcode, imageurl)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (id_number, first_name, last_name, gender, year_level, program_code, image_url)
            )
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            raise e
        finally:
            cursor.close()

    @staticmethod
    def update_student(original_id, new_id, new_first_name, new_last_name, new_gender, new_year_level, new_program_code, image_url=None):
        db = get_db()
        cursor = db.cursor()
        try:
            if image_url is not None:
                query = """
                    UPDATE students
                    SET idnumber = %s, firstname = %s, lastname = %s, 
                        gender = %s, yearlevel = %s, programcode = %s, imageurl = %s
                    WHERE idnumber = %s
                """
                params = (new_id, new_first_name, new_last_name, new_gender, new_year_level, new_program_code, image_url, original_id)
            else:
                query = """
                    UPDATE students
                    SET idnumber = %s, firstname = %s, lastname = %s, 
                        gender = %s, yearlevel = %s, programcode = %s
                    WHERE idnumber = %s
                """
                params = (new_id, new_first_name, new_last_name, new_gender, new_year_level, new_program_code, original_id)
            
            cursor.execute(query, params)
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