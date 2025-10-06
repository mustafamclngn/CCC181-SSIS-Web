from flask import Flask, render_template, Blueprint, request, flash, redirect, url_for
from app.database import close_db, get_db

dashboard_bp = Blueprint("dashboard", __name__, template_folder="templates")

@dashboard_bp.route("/dashboard")
def dashboard():
    db = get_db()
    cursor = db.cursor()

    try:
        # count registered colleges
        cursor.execute("SELECT COUNT(*) FROM colleges")
        total_colleges = cursor.fetchone()[0]

        # count registered programs
        cursor.execute("SELECT COUNT(*) FROM programs")
        total_programs = cursor.fetchone()[0]

        # count registered students
        cursor.execute("SELECT COUNT(*) FROM students")
        total_students = cursor.fetchone()[0]

        # top 5 registered students in college count
        cursor.execute("""
            SELECT c.collegename, COUNT(s.idnumber) AS student_count
            FROM colleges c
            LEFT JOIN programs p ON c.collegecode = p.collegecode
            LEFT JOIN students s ON p.programcode = s.programcode
            GROUP BY c.collegename
            ORDER BY student_count DESC
            LIMIT 5;
        """)
        top_colleges = cursor.fetchall()

        # top 5 registered students in program count
        cursor.execute("""
            SELECT p.programname, COUNT(s.idnumber) AS student_count
            FROM programs p
            LEFT JOIN students s ON p.programcode = s.programcode
            GROUP BY p.programname
            ORDER BY student_count DESC
            LIMIT 5;
        """)
        top_programs = cursor.fetchall()

    finally:
        cursor.close()

    return render_template(
        "dashboard.html",
        total_colleges=total_colleges,
        total_programs=total_programs,
        total_students=total_students,
        top_colleges=top_colleges,
        top_programs=top_programs,
    )
