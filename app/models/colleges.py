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
    def get_colleges_server_side(draw, start, length, search_value, sort_column, sort_direction, code_filter=None, name_filter=None):
        db = get_db()
        cursor = db.cursor(cursor_factory=RealDictCursor)
        
        query = "SELECT collegecode, collegename FROM colleges WHERE 1=1"
        count_query = "SELECT COUNT(*) FROM colleges WHERE 1=1"
        params = []
        
        if search_value:
            query += " AND (collegecode ILIKE %s OR collegename ILIKE %s)"
            count_query += " AND (collegecode ILIKE %s OR collegename ILIKE %s)"
            search_term = f"%{search_value}%"
            params.extend([search_term, search_term])

        if code_filter:
            query += " AND collegecode ILIKE %s"
            count_query += " AND collegecode ILIKE %s"
            params.append(f"%{code_filter}%")
            
        if name_filter:
            query += " AND collegename ILIKE %s"
            count_query += " AND collegename ILIKE %s"
            params.append(f"%{name_filter}%")

        valid_columns = ["collegecode", "collegename"]
        if sort_column not in valid_columns:
            sort_column = "collegecode"
            
        if sort_direction not in ["asc", "desc"]:
            sort_direction = "asc"

        query += f" ORDER BY {sort_column} {sort_direction}"

        data_query = query + " LIMIT %s OFFSET %s"
        data_params = params + [length, start]

        try:
            cursor.execute("SELECT COUNT(*) FROM colleges")
            total_records = cursor.fetchone()['count']

            cursor.execute(count_query, tuple(params))
            records_filtered = cursor.fetchone()['count']

            cursor.execute(data_query, tuple(data_params))
            data = cursor.fetchall()
            
            return {
                "draw": draw,
                "recordsTotal": total_records,
                "recordsFiltered": records_filtered,
                "data": [dict(row) for row in data]
            }

        except Exception as e:
            print(f"Error fetching server-side colleges: {e}")
            return {
                "draw": draw,
                "recordsTotal": 0,
                "recordsFiltered": 0,
                "data": [],
                "error": str(e)
            }
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