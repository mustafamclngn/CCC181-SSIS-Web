from app.database import get_db

class DashboardModel:
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