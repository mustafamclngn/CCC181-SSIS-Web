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

class ProgramModel:
    @staticmethod
    def get_all_colleges():
        with db_cursor() as cursor:
            cursor.execute("""
                SELECT collegecode AS code, collegename AS name 
                FROM colleges 
                ORDER BY collegecode ASC
            """)
            colleges = cursor.fetchall()
            return [dict(row) for row in colleges]
    
    @staticmethod
    def get_all_programs():
        with db_cursor() as cursor:
            cursor.execute("""
                SELECT 
                    p.programcode AS code, 
                    p.programname AS name, 
                    p.collegecode AS college_code,
                    c.collegename AS college_name
                FROM programs p
                LEFT JOIN colleges c ON p.collegecode = c.collegecode
                ORDER BY p.programcode ASC
            """)
            programs = cursor.fetchall()
            return [dict(row) for row in programs]

    @staticmethod
    def get_programs_server_side(start, length, draw, search_value, order_column, order_dir, column_filters=None):
        with db_cursor() as cursor:
            columns = {
                0: 'p.programcode',
                1: 'p.programname',
                2: 'p.collegecode',
                3: 'actions'
            }

            base_query = """
                FROM programs p
                LEFT JOIN colleges c ON p.collegecode = c.collegecode
            """
            
            where_clauses = []
            params = {}

            if search_value:
                search_query = """
                    (p.programcode ILIKE %(search_value)s OR
                     p.programname ILIKE %(search_value)s OR
                     p.collegecode ILIKE %(search_value)s)
                """
                where_clauses.append(search_query)
                params['search_value'] = f'%{search_value}%'
            
            if column_filters:
                if 0 in column_filters and column_filters[0]:
                    where_clauses.append("p.programcode ILIKE %(col_0_search)s")
                    params['col_0_search'] = f"%{column_filters[0]}%"
                
                if 1 in column_filters and column_filters[1]:
                    where_clauses.append("p.programname ILIKE %(col_1_search)s")
                    params['col_1_search'] = f"%{column_filters[1]}%"

                if 2 in column_filters and column_filters[2]:
                    where_clauses.append("p.collegecode ILIKE %(col_2_search)s")
                    params['col_2_search'] = f"%{column_filters[2]}%"

            where_sql = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""

            cursor.execute("SELECT COUNT(*) AS total FROM programs p")
            total_records = cursor.fetchone()['total']

            cursor.execute(f"SELECT COUNT(*) AS filtered_total {base_query} {where_sql}", params)
            total_filtered = cursor.fetchone()['filtered_total']

            order_by = 'p.programcode ASC'
            if order_column in columns and columns[order_column] != 'actions':
                column_name = columns[order_column]
                order_by = f"{column_name} {order_dir}"
            
            data_query = f"""
                SELECT 
                    p.programcode AS code, 
                    p.programname AS name, 
                    p.collegecode AS college_code,
                    c.collegename AS college_name
                {base_query}
                {where_sql}
                ORDER BY {order_by}
                LIMIT %(limit)s OFFSET %(offset)s
            """
            
            params['limit'] = length
            params['offset'] = start
            
            cursor.execute(data_query, params)
            programs_data = cursor.fetchall()
            
            return {
                "draw": draw,
                "recordsTotal": total_records,
                "recordsFiltered": total_filtered,
                "data": [dict(row) for row in programs_data]
            }

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