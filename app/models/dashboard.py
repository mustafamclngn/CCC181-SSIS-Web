from app.database import get_db
from psycopg2.extras import RealDictCursor

class DashboardModel:
    @staticmethod
    def get_all_dashboard_data(top_limit=5):
        db = get_db()
        cursor = db.cursor(cursor_factory=RealDictCursor)
        try:
            cursor.execute("""
                WITH college_stats AS (
                    SELECT 
                        c.collegename,
                        c.collegecode,
                        COUNT(DISTINCT p.programcode) AS program_count,
                        COUNT(DISTINCT s.idnumber) AS student_count
                    FROM colleges c
                    LEFT JOIN programs p ON c.collegecode = p.collegecode
                    LEFT JOIN students s ON p.programcode = s.programcode
                    GROUP BY c.collegecode, c.collegename
                ),
                program_stats AS (
                    SELECT 
                        p.programname,
                        COUNT(s.idnumber) AS student_count
                    FROM programs p
                    LEFT JOIN students s ON p.programcode = s.programcode
                    GROUP BY p.programname
                )
                SELECT 
                    -- Total counts
                    (SELECT COUNT(*) FROM colleges) AS total_colleges,
                    (SELECT COUNT(*) FROM programs) AS total_programs,
                    (SELECT COUNT(*) FROM students) AS total_students,
                    
                    -- Top colleges (as JSON array)
                    (
                        SELECT json_agg(row_to_json(t))
                        FROM (
                            SELECT collegename, student_count
                            FROM college_stats
                            ORDER BY student_count DESC
                            LIMIT %s
                        ) t
                    ) AS top_colleges,
                    
                    -- Top programs (as JSON array)
                    (
                        SELECT json_agg(row_to_json(t))
                        FROM (
                            SELECT programname, student_count
                            FROM program_stats
                            ORDER BY student_count DESC
                            LIMIT %s
                        ) t
                    ) AS top_programs,
                    
                    -- All college statistics (as JSON array)
                    (
                        SELECT json_agg(row_to_json(t))
                        FROM (
                            SELECT 
                                collegename AS name,
                                collegecode AS code,
                                program_count,
                                student_count
                            FROM college_stats
                            ORDER BY collegename
                        ) t
                    ) AS college_statistics
            """, (top_limit, top_limit))
            
            result = cursor.fetchone()
            
            return {
                'total_colleges': result['total_colleges'] or 0,
                'total_programs': result['total_programs'] or 0,
                'total_students': result['total_students'] or 0,
                'top_colleges': result['top_colleges'] or [],
                'top_programs': result['top_programs'] or [],
                'college_statistics': result['college_statistics'] or []
            }
        finally:
            cursor.close()

    @staticmethod
    def get_total_colleges():
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM colleges")
            return cursor.fetchone()[0]
        finally:
            cursor.close()

    @staticmethod
    def get_total_programs():
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM programs")
            return cursor.fetchone()[0]
        finally:
            cursor.close()

    @staticmethod
    def get_total_students():
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM students")
            return cursor.fetchone()[0]
        finally:
            cursor.close()

    @staticmethod
    def get_top_colleges(limit=5):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("""
                SELECT c.collegename, COUNT(s.idnumber) AS student_count
                FROM colleges c
                LEFT JOIN programs p ON c.collegecode = p.collegecode
                LEFT JOIN students s ON p.programcode = s.programcode
                GROUP BY c.collegename
                ORDER BY student_count DESC
                LIMIT %s
            """, (limit,))
            return cursor.fetchall()
        finally:
            cursor.close()

    @staticmethod
    def get_top_programs(limit=5):
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("""
                SELECT p.programname, COUNT(s.idnumber) AS student_count
                FROM programs p
                LEFT JOIN students s ON p.programcode = s.programcode
                GROUP BY p.programname
                ORDER BY student_count DESC
                LIMIT %s
            """, (limit,))
            return cursor.fetchall()
        finally:
            cursor.close()

    @staticmethod
    def get_college_statistics():
        db = get_db()
        cursor = db.cursor()
        try:
            cursor.execute("""
                SELECT 
                    c.collegename AS name,
                    c.collegecode AS code,
                    COUNT(DISTINCT p.programcode) AS program_count,
                    COUNT(DISTINCT s.idnumber) AS student_count
                FROM colleges c
                LEFT JOIN programs p ON c.collegecode = p.collegecode
                LEFT JOIN students s ON p.programcode = s.programcode
                GROUP BY c.collegecode, c.collegename
                ORDER BY c.collegename
            """)
            college_statistics_raw = cursor.fetchall()
            
            return [
                {
                    'name': row[0],
                    'code': row[1],
                    'program_count': row[2],
                    'student_count': row[3]
                }
                for row in college_statistics_raw
            ]
        finally:
            cursor.close()