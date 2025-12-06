from flask import Flask, render_template, Blueprint, request, flash, redirect, url_for, jsonify
from app.models.programs import ProgramModel
from app.auth_decorators import login_required

program_bp = Blueprint("program", __name__, template_folder="templates")

# ==============================
# PROGRAMS PAGE
# ==============================
@program_bp.route("/programs")
@login_required
def programs():
    colleges_list = ProgramModel.get_all_colleges()
    return render_template(
        "programs.html",
        colleges=colleges_list
    )

@program_bp.route("/programs/data")
@login_required
def programs_data():
    try:
        draw = int(request.args.get('draw', 1))
        start = int(request.args.get('start', 0))
        length = int(request.args.get('length', 10))
        search_value = request.args.get('search[value]', '')
        
        order_column = int(request.args.get('order[0][column]', 0))
        order_dir = request.args.get('order[0][dir]', 'asc')

        column_filters = {}
        for i in range(3):
            val = request.args.get(f'columns[{i}][search][value]', '')
            if val:
                column_filters[i] = val

        data = ProgramModel.get_programs_server_side(
            start, length, draw, search_value, order_column, order_dir, column_filters
        )
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========= CHECK IF PROGRAM EXISTS (AJAX) =========
@program_bp.route("/programs/check", methods=["POST"])
@login_required
def check_program():
    data = request.get_json()
    code = data.get("code", "").strip().upper()
    name = data.get("name", "").strip().title()
    original_code = data.get("original_code", "").strip().upper()

    try:
        exists = ProgramModel.check_program_exists(code, name, original_code if original_code else None)
        return jsonify({"exists": exists})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# REGISTER PROGRAM
# ==============================
@program_bp.route("/programs/register", methods=["POST"])
@login_required
def register_program():
    program_code = request.form.get("code", "").strip().upper()
    program_name = request.form.get("name", "").strip().title()
    college_code = request.form.get("college_code", "").strip().upper()

    if not program_code or not program_name or not college_code:
        flash("All fields are required.", "danger")
        return redirect(url_for("program.programs"))

    try:
        if ProgramModel.check_program_exists(program_code, program_name):
            flash("Program code or name already exists.", "warning")
            return redirect(url_for("program.programs"))

        ProgramModel.create_program(program_code, program_name, college_code)
        flash("Program registered successfully!", "success")
        return redirect(url_for("program.programs"))
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")
        return redirect(url_for("program.programs"))


# ==============================
# EDIT PROGRAM
# ==============================
@program_bp.route("/programs/edit", methods=["POST"])
@login_required
def edit_program():
    original_code = request.form.get("original_code", "").strip().upper()
    new_code = request.form.get("code", "").strip().upper()
    new_name = request.form.get("name", "").strip().title()
    new_college_code = request.form.get("college_code", "").strip().upper()

    if not original_code or not new_code or not new_name or not new_college_code:
        flash("All fields are required.", "danger")
        return redirect(url_for("program.programs"))

    try:
        if ProgramModel.check_program_exists(new_code, new_name, original_code):
            flash("Program code or name already exists.", "warning")
            return redirect(url_for("program.programs"))

        ProgramModel.update_program(original_code, new_code, new_name, new_college_code)
        flash("Program updated successfully!", "success")
        return redirect(url_for("program.programs"))
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")
        return redirect(url_for("program.programs"))


# ==============================
# DELETE PROGRAM
# ==============================
@program_bp.route("/programs/delete", methods=["POST"])
@login_required
def delete_program():
    code = request.form.get("code", "").strip().upper()

    if not code:
        flash("Program code is missing!", "danger")
        return redirect(url_for("program.programs"))

    try:
        ProgramModel.delete_program(code)
        flash("Program deleted successfully!", "success")
        return redirect(url_for("program.programs"))
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")
        return redirect(url_for("program.programs"))