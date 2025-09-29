from flask import Flask, render_template, Blueprint, request, flash, redirect, url_for
from app.database import close_db, get_db

student_bp = Blueprint("student", __name__, template_folder="templates")

@student_bp.route("/students")
def students():
    db = get_db()

    cursor = db.cursor()
    cursor.execute("SELECT programcode, programname FROM programs ORDER BY programname ASC")
    programs_data = cursor.fetchall()
    cursor.close()

    programs_list = [{"code": p[0], "name": p[1]} for p in programs_data]

    cursor = db.cursor()
    cursor.execute("""
        SELECT idnumber, firstname, lastname, gender, yearlevel, programcode
        FROM students
        ORDER BY lastname, firstname
    """)
    students_data = cursor.fetchall()
    cursor.close()

    students_list = [
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

    return render_template(
        "students.html",
        page_title="Students",
        students=students_list,
        programs=programs_list
    )

# ========= REGISTER STUDENT =========
# ========= REGISTER STUDENT =========
# ========= REGISTER STUDENT =========

@student_bp.route("/students/register", methods=["POST"])
def register_student():
    id_number = request.form.get("id_number", "").strip()
    first_name = request.form.get("first_name", "").strip().title()
    last_name = request.form.get("last_name", "").strip().title()
    gender = request.form.get("gender", "").strip().title()
    year_level = request.form.get("year_level", "").strip()
    program_code = request.form.get("program_code", "").strip().upper()

    if not id_number or not first_name or not last_name or not gender or not year_level or not program_code:
        return {"success": False, "message": "All fields are required."}, 400

    db = get_db()
    cursor = db.cursor()
    try:
        # ✅ Check if student with same ID already exists
        cursor.execute("SELECT idnumber FROM students WHERE idnumber = %s", (id_number,))
        existing = cursor.fetchone()
        if existing:
            return {"success": False, "message": "Student ID already exists."}, 400

        # If not duplicate, insert
        cursor.execute(
            """
            INSERT INTO students (idnumber, firstname, lastname, gender, yearlevel, programcode)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (id_number, first_name, last_name, gender, year_level, program_code)
        )
        db.commit()
        return {"success": True, "message": "Student registered successfully."}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}, 500
    finally:
        cursor.close()

# ========= EDIT STUDENT =========
# ========= EDIT STUDENT =========
# ========= EDIT STUDENT =========

@student_bp.route("/students/edit", methods=["POST"])
def edit_student():
    original_id = request.form.get("original_id", "").strip()
    id_number = request.form.get("id_number", "").strip()
    first_name = request.form.get("first_name", "").strip().title()
    last_name = request.form.get("last_name", "").strip().title()
    gender = request.form.get("gender", "").strip().title()
    year_level = request.form.get("year_level", "").strip()
    program_code = request.form.get("program_code", "").strip().upper()

    if not original_id or not id_number or not first_name or not last_name or not gender or not year_level or not program_code:
        return {"success": False, "message": "All fields are required."}, 400

    db = get_db()
    cursor = db.cursor()
    try:
        # 🔹 Check if new ID already exists (and is not the same as original)
        cursor.execute(
            "SELECT idnumber FROM students WHERE idnumber = %s AND idnumber != %s",
            (id_number, original_id)
        )
        duplicate = cursor.fetchone()
        if duplicate:
            return {"success": False, "message": "A student with this ID already exists."}, 400

        # 🔹 Proceed with update
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
            (id_number, first_name, last_name, gender, year_level, program_code, original_id)
        )
        db.commit()
        return {"success": True, "message": "Student updated successfully!"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}, 500
    finally:
        cursor.close()


# ========= DELETE STUDENT =========
# ========= DELETE STUDENT =========
# ========= DELETE STUDENT =========

@student_bp.route("/students/delete", methods=["POST"])
def delete_student():
    student_id = request.form.get("id_number", "").strip()

    if not student_id:
        return {"success": False, "message": "Student ID is required."}, 400

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM students WHERE idnumber = %s", (student_id,))
        db.commit()
        return {"success": True, "message": f"Student deleted successfully!"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}, 500
    finally:
        cursor.close()