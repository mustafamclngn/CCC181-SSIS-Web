from flask import Flask, render_template, Blueprint, request, flash, redirect, url_for, jsonify
from app.models.students import StudentModel
from app.auth_decorators import login_required
from werkzeug.utils import secure_filename
import os
import uuid
import psycopg2 

student_bp = Blueprint("student", __name__, template_folder="templates")

from supabase import create_client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 5 * 1024 * 1024
BUCKET_NAME = 'students-images'

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_default_avatar_url():
    try:
        return supabase.storage.from_(BUCKET_NAME).get_public_url('default-avatar.png')
    except Exception as e:
        print(f"Error getting default avatar: {e}")
        return None

def upload_student_image(file, student_id):
    if not file or file.filename == '' or not allowed_file(file.filename):
        return None
    
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise ValueError('Image file size must be less than 5MB')
    
    file_ext = os.path.splitext(secure_filename(file.filename))[1]
    unique_filename = f"{student_id}_{uuid.uuid4().hex}{file_ext}"
    
    file_bytes = file.read()
    
    try:
        storage_response = supabase.storage.from_(BUCKET_NAME).upload(
            path=unique_filename,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )
        
        image_url = supabase.storage.from_(BUCKET_NAME).get_public_url(unique_filename)
        return image_url
        
    except Exception as storage_error:
        print(f"Storage error: {storage_error}")
        raise Exception('Error uploading image to storage')

def delete_student_image(image_url):
    if not image_url:
        return False
    
    try:
        filename = image_url.split('/')[-1]
        
        if 'default-avatar' in filename:
            return False
        
        supabase.storage.from_(BUCKET_NAME).remove([filename])
        return True
        
    except Exception as e:
        print(f"Error deleting image: {e}")
        return False

# ==============================
# STUDENTS PAGE
# ==============================
@student_bp.route("/students")
@login_required
def students():
    programs_list = StudentModel.get_all_programs()
    students_list = StudentModel.get_all_students()
    default_avatar = get_default_avatar_url()

    return render_template(
        "students.html",
        page_title="Students",
        students=students_list,
        programs=programs_list,
        default_avatar=default_avatar
    )

# ==============================
# CHECK IF STUDENT EXISTS (AJAX)
# ==============================
@student_bp.route("/students/check", methods=["POST"])
@login_required
def check_student():
    data = request.get_json()
    id_number = data.get("id_number", "").strip()
    original_id = data.get("original_id", "").strip()

    try:
        exists = StudentModel.check_student_exists(id_number, original_id if original_id else None)
        return jsonify({"exists": exists})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==============================
# REGISTER STUDENT
# ==============================
@student_bp.route("/students/register", methods=["POST"])
@login_required
def register_student():
    id_number = request.form.get("id_number", "").strip()
    first_name = request.form.get("first_name", "").strip().title()
    last_name = request.form.get("last_name", "").strip().title()
    gender = request.form.get("gender", "").strip().title()
    year_level = request.form.get("year_level", "").strip()
    program_code = request.form.get("program_code", "").strip().upper()

    if not id_number or not first_name or not last_name or not gender or not year_level or not program_code:
        flash("All fields are required.", "danger")
        return redirect(url_for("student.students"))

    image_url = None
    if 'student_image' in request.files:
        file = request.files['student_image']
        try:
            image_url = upload_student_image(file, id_number)
        except ValueError as e:
            flash(str(e), 'danger')
            return redirect(url_for('student.students'))
        except Exception as e:
            flash('Error uploading image', 'warning')
            print(f"Upload error: {e}")

    if not image_url:
        image_url = get_default_avatar_url()

    try:
        StudentModel.create_student(id_number, first_name, last_name, gender, year_level, program_code, image_url)
        flash("Student registered successfully!", "success")
    except psycopg2.IntegrityError as e:
        if 'already exists' in str(e) or 'duplicate key' in str(e):
            flash("Student ID already exists.", "warning")
        else:
            flash(f"Database error: {str(e)}", "danger")
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")

    return redirect(url_for("student.students"))

# ==============================
# EDIT STUDENT
# ==============================
@student_bp.route("/students/edit", methods=["POST"])
@login_required
def edit_student():
    original_id = request.form.get("original_id", "").strip()
    id_number = request.form.get("id_number", "").strip()
    first_name = request.form.get("first_name", "").strip().title()
    last_name = request.form.get("last_name", "").strip().title()
    gender = request.form.get("gender", "").strip().title()
    year_level = request.form.get("year_level", "").strip()
    program_code = request.form.get("program_code", "").strip().upper()
    remove_image = request.form.get("remove_image", "0") == "1"  # ADD THIS LINE

    if not original_id or not id_number or not first_name or not last_name or not gender or not year_level or not program_code:
        flash("All fields are required.", "danger")
        return redirect(url_for("student.students"))

    try:
        current_student = StudentModel.get_student_by_id(original_id)
        old_image_url = current_student.get('image_url') if current_student else None
    except:
        old_image_url = None

    image_url = old_image_url
    
    if remove_image:
        if old_image_url and 'default-avatar' not in old_image_url:
            delete_student_image(old_image_url)
        image_url = get_default_avatar_url()
    elif 'student_image' in request.files:
        file = request.files['student_image']
        if file and file.filename != '':
            try:
                if old_image_url and 'default-avatar' not in old_image_url:
                    delete_student_image(old_image_url)
                
                image_url = upload_student_image(file, id_number)
                
            except ValueError as e:
                flash(str(e), 'danger')
                return redirect(url_for('student.students'))
            except Exception as e:
                flash('Error uploading image', 'warning')
                print(f"Upload error: {e}")

    if not image_url:
        image_url = get_default_avatar_url()

    try:
        StudentModel.update_student(original_id, id_number, first_name, last_name, gender, year_level, program_code, image_url)
        flash("Student updated successfully!", "success")
    except psycopg2.IntegrityError as e:
        if 'already exists' in str(e) or 'duplicate key' in str(e):
            flash("A student with this ID already exists.", "warning")
        else:
            flash(f"Database error: {str(e)}", "danger")
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")

    return redirect(url_for("student.students"))

# ==============================
# DELETE STUDENT
# ==============================
@student_bp.route("/students/delete", methods=["POST"])
@login_required
def delete_student():
    id_number = request.form.get("id_number", "").strip()

    if not id_number:
        flash("Student ID is required!", "danger")
        return redirect(url_for("student.students"))

    try:
        student = StudentModel.get_student_by_id(id_number)
        if student and student.get('image_url'):
            delete_student_image(student['image_url'])
        
        # delete student from db
        StudentModel.delete_student(id_number)
        flash("Student deleted successfully!", "success")
    except Exception as e:
        flash(f"Error: {str(e)}", "danger")

    return redirect(url_for("student.students"))