from flask import Flask, render_template, Blueprint, request, flash, redirect, url_for
from app.database import close_db, get_db

program_bp = Blueprint("program", __name__, template_folder="templates")

@program_bp.route("/programs")
def programs():
    db = get_db()

    cursor = db.cursor()
    cursor.execute("SELECT collegecode, collegename FROM colleges ORDER BY collegecode ASC")
    colleges_data = cursor.fetchall()
    cursor.close()

    colleges_list = [{"code": c[0], "name": c[1]} for c in colleges_data]

    cursor = db.cursor()
    cursor.execute("SELECT programcode, programname, collegecode FROM programs ORDER BY programcode ASC")
    programs_data = cursor.fetchall()
    cursor.close()

    programs_list = [{"code": p[0], "name": p[1], "college_code": p[2]} for p in programs_data]

    return render_template(
        "programs.html",
        programs=programs_list,
        colleges=colleges_list
    )

# ========= REGISTER PROGRAM =========
# ========= REGISTER PROGRAM =========
# ========= REGISTER PROGRAM =========

@program_bp.route("/programs/register", methods=["POST"])
def register_program():
    program_code = request.form.get("code", "").strip().upper()
    program_name = request.form.get("name", "").strip().title()
    college_code = request.form.get("college_code", "").strip().upper()

    if not program_code or not program_name or not college_code:
        return {"success": False, "message": "All fields are required."}, 400

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO programs (programcode, programname, collegecode) VALUES (%s, %s, %s)",
            (program_code, program_name, college_code)
        )
        db.commit()
        return {"success": True, "message": f"Program {program_name} registered successfully!"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}, 500
    finally:
        cursor.close()

# ========= EDIT PROGRAM =========
# ========= EDIT PROGRAM =========
# ========= EDIT PROGRAM =========

@program_bp.route("/programs/edit", methods=["POST"])
def edit_program():
    db = get_db()

    original_code = request.form.get("original_code", "").strip().upper()
    new_code = request.form.get("code", "").strip().upper()
    new_name = request.form.get("name", "").strip().title()
    new_college_code = request.form.get("college_code", "").strip().upper()

    if not original_code or not new_code or not new_name or not new_college_code:
        return {"success": False, "message": "All fields are required."}, 400

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
        return {"success": True, "message": f"Program {new_code} updated successfully!"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": str(e)}, 500
    finally:
        cursor.close()

# ========= DELETE PROGRAM =========
# ========= DELETE PROGRAM =========
# ========= DELETE PROGRAM =========

@program_bp.route("/programs/delete", methods=["POST"])
def delete_program():
    code = request.form.get("code", "").strip().upper()

    if not code:
        flash("Program code is missing!", "danger")
        return redirect(url_for("program.programs"))

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM programs WHERE programcode = %s", (code,))
        db.commit()
        flash(f"Program {code} deleted successfully.", "success")
    except Exception as e:
        db.rollback()
        flash(f"Error deleting program: {e}", "danger")
        print(f"DEBUG: Exception deleting program: {e}")
    finally:
        cursor.close()

    return redirect(url_for("program.programs"))
