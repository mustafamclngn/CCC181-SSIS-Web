from flask import Flask, render_template, Blueprint, request, redirect, url_for, flash, jsonify
from app.models.colleges import CollegeModel
from app.auth_decorators import login_required

college_bp = Blueprint("college", __name__, template_folder="templates")

@college_bp.route("/colleges")
@login_required
def colleges():
    colleges_list = CollegeModel.get_all_colleges()
    return render_template("colleges.html", colleges=colleges_list)


# ========= CHECK IF COLLEGE EXISTS (AJAX) =========
@college_bp.route("/colleges/check", methods=["POST"])
@login_required
def check_college():
    data = request.get_json()
    code = data.get("code", "").strip().upper()
    name = data.get("name", "").strip().title()
    original_code = data.get("original_code", "").strip().upper()

    try:
        exists = CollegeModel.check_college_exists(code, name, original_code if original_code else None)
        return jsonify({"exists": exists})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ========= REGISTER COLLEGE =========
@college_bp.route("/colleges/register", methods=["POST"])
@login_required
def register_college():
    code = request.form.get("code", "").strip().upper()
    name = request.form.get("name", "").strip().title()

    if not code or not name:
        flash("All fields are required.", "danger")
        return redirect(url_for("college.colleges"))

    try:
        if CollegeModel.check_college_exists(code, name):
            flash("College code or name already exists.", "warning")
            return redirect(url_for("college.colleges"))

        CollegeModel.create_college(code, name)
        flash("College registered successfully!", "success")
        return redirect(url_for("college.colleges"))
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")
        return redirect(url_for("college.colleges"))


# ========= EDIT COLLEGE =========
@college_bp.route("/colleges/edit", methods=["POST"])
@login_required
def edit_college():
    original_code = request.form.get("original_code", "").strip().upper()
    new_code = request.form.get("code", "").strip().upper()
    new_name = request.form.get("name", "").strip().title()

    if not original_code or not new_code or not new_name:
        flash("All fields are required.", "danger")
        return redirect(url_for("college.colleges"))

    try:
        if CollegeModel.check_college_exists(new_code, new_name, original_code):
            flash("College code or name already exists.", "warning")
            return redirect(url_for("college.colleges"))

        CollegeModel.update_college(original_code, new_code, new_name)
        flash("College updated successfully!", "success")
        return redirect(url_for("college.colleges"))
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")
        return redirect(url_for("college.colleges"))


# ========= DELETE COLLEGE =========
@college_bp.route("/colleges/delete", methods=["POST"])
@login_required
def delete_college():
    code = request.form.get("code", "").strip().upper()

    if not code:
        flash("College code is missing!", "danger")
        return redirect(url_for("college.colleges"))

    try:
        CollegeModel.delete_college(code)
        flash("College deleted successfully!", "success")
        return redirect(url_for("college.colleges"))
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")
        return redirect(url_for("college.colleges"))