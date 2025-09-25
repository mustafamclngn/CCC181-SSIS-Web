from flask import Flask, render_template, Blueprint, request, flash, redirect, url_for
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

# ========= REGISTER COLLEGE =========
# ========= REGISTER COLLEGE =========
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
        cursor.execute("INSERT INTO colleges (collegecode, collegename) VALUES (%s, %s)", (code, name))
        db.commit()
        flash("College registered successfully!", "success")
    except Exception as e:
        db.rollback()
        flash(f"Error registering college: {str(e)}", "danger")
        print(f"DEBUG: Exception: {e}")
    finally:
        cursor.close()

    return redirect(url_for("college.colleges"))

# ========= DELETE COLLEGE =========
# ========= DELETE COLLEGE =========
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
        flash(f"College {code} and its related programs/students deleted.", "success")
    except Exception as e:
        db.rollback()
        flash(f"Error deleting college: {str(e)}", "danger")
        print(f"DEBUG: Exception while deleting college: {e}")
    finally:
        cursor.close()

    return redirect(url_for("college.colleges"))

# ========= EDIT COLLEGE =========
# ========= EDIT COLLEGE =========
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
            """
            UPDATE colleges
            SET collegecode = %s, collegename = %s
            WHERE collegecode = %s
            """,
            (new_code, new_name, original_code)
        )
        db.commit()
        flash("College updated successfully!", "success")
    except Exception as e:
        db.rollback()
        flash(f"Error updating college: {str(e)}", "danger")
        print(f"DEBUG: Exception: {e}")
    finally:
        cursor.close()

    return redirect(url_for("college.colleges"))
