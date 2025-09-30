from flask import Flask, render_template, Blueprint, request, flash, redirect, url_for
from app.database import close_db, get_db

dashboard_bp = Blueprint("dashboard", __name__, template_folder="templates")

@dashboard_bp.route("/")
def dashboard():
    db = get_db()
    cursor = db.cursor()

    try:
        # Count colleges
        cursor.execute("SELECT COUNT(*) FROM colleges")
        total_colleges = cursor.fetchone()[0]

        # Count programs
        cursor.execute("SELECT COUNT(*) FROM programs")
        total_programs = cursor.fetchone()[0]

        # Count students
        cursor.execute("SELECT COUNT(*) FROM students")
        total_students = cursor.fetchone()[0]

    finally:
        cursor.close()

    return render_template(
        "dashboard.html",
        total_colleges=total_colleges,
        total_programs=total_programs,
        total_students=total_students,
    )