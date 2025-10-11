from flask import Flask, render_template, Blueprint, request, redirect, url_for, flash, jsonify
from app.database import close_db, get_db

college_bp = Blueprint("college", __name__, template_folder="templates")

@college_bp.route("/colleges")
def colleges():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM colleges ORDER BY collegecode ASC")
    colleges_data = cursor.fetchall()
    cursor.close()

    colleges_list = [{"collegecode": c[0], "collegename": c[1]} for c in colleges_data]

    return render_template(
        "colleges.html",
        colleges=colleges_list,
    )


# ========= CHECK IF COLLEGE EXISTS (AJAX) =========
@college_bp.route("/colleges/check", methods=["POST"])
def check_college():
    data = request.get_json()
    code = data.get("code", "").strip().upper()
    name = data.get("name", "").strip().title()
    original_code = data.get("original_code", "").strip().upper()

    db = get_db()
    cursor = db.cursor()
    try:
        if original_code:
            cursor.execute(
                "SELECT COUNT(*) FROM colleges WHERE (collegecode = %s OR collegename = %s) AND collegecode != %s",
                (code, name, original_code)
            )
        else:
            cursor.execute(
                "SELECT COUNT(*) FROM colleges WHERE collegecode = %s OR collegename = %s",
                (code, name)
            )
        
        exists = cursor.fetchone()[0] > 0
        return jsonify({"exists": exists})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()


# ========= REGISTER COLLEGE =========
@college_bp.route("/colleges/register", methods=["POST"])
def register_college():
    code = request.form.get("code", "").strip().upper()
    name = request.form.get("name", "").strip().title()

    if not code or not name:
        flash("All fields are required.", "danger")
        return redirect(url_for("college.colleges"))

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("SELECT COUNT(*) FROM colleges WHERE collegecode = %s OR collegename = %s", (code, name))
        if cursor.fetchone()[0] > 0:
            flash("College code or name already exists.", "warning")
            return redirect(url_for("college.colleges"))

        cursor.execute("INSERT INTO colleges (collegecode, collegename) VALUES (%s, %s)", (code, name))
        db.commit()
        flash("College registered successfully!", "success")
        return redirect(url_for("college.colleges"))
    except Exception as e:
        db.rollback()
        flash(f"Error: {str(e)}", "danger")
        return redirect(url_for("college.colleges"))
    finally:
        cursor.close()


# ========= EDIT COLLEGE =========
@college_bp.route("/colleges/edit", methods=["POST"])
def edit_college():
    original_code = request.form.get("original_code", "").strip().upper()
    new_code = request.form.get("code", "").strip().upper()
    new_name = request.form.get("name", "").strip().title()

    if not original_code or not new_code or not new_name:
        flash("All fields are required.", "danger")
        return redirect(url_for("college.colleges"))

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "SELECT COUNT(*) FROM colleges WHERE (collegecode = %s OR collegename = %s) AND collegecode != %s",
            (new_code, new_name, original_code)
        )
        if cursor.fetchone()[0] > 0:
            flash("College code or name already exists.", "warning")
            return redirect(url_for("college.colleges"))

        cursor.execute(
            "UPDATE colleges SET collegecode = %s, collegename = %s WHERE collegecode = %s",
            (new_code, new_name, original_code)
        )
        db.commit()
        flash("College updated successfully!", "success")
        return redirect(url_for("college.colleges"))
    except Exception as e:
        db.rollback()
        flash(f"Error: {str(e)}", "danger")
        return redirect(url_for("college.colleges"))
    finally:
        cursor.close()


# ========= DELETE COLLEGE =========
@college_bp.route("/colleges/delete", methods=["POST"])
def delete_college():
    code = request.form.get("code", "").strip().upper()

    if not code:
        flash("College code is missing!", "danger")
        return redirect(url_for("college.colleges"))

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("DELETE FROM colleges WHERE collegecode = %s", (code,))
        db.commit()
        flash("College deleted successfully!", "success")
        return redirect(url_for("college.colleges"))
    except Exception as e:
        db.rollback()
        flash(f"Error: {str(e)}", "danger")
        return redirect(url_for("college.colleges"))
    finally:
        cursor.close()