from flask import Blueprint, render_template, redirect, url_for, flash, session
from werkzeug.security import check_password_hash
from app.models.users import UserModel
from app.user.forms import RegisterForm, LoginForm
from app.auth_decorators import login_required, logout_required

user_bp = Blueprint("user", __name__, template_folder="templates")

# ==============================
# LOGIN
# ==============================
@user_bp.route("/login", methods=["GET", "POST"])
@logout_required
def login():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data

        user = UserModel.get_user_by_username(username)

        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            session.permanent = form.remember_me.data
            flash("Welcome back!", "success")
            return redirect(url_for("dashboard.dashboard"))
        else:
            flash("Invalid username or password.", "danger")

    return render_template("login.html", form=form)

# ==============================
# REGISTER
# ==============================
@user_bp.route("/register", methods=["GET", "POST"])
@logout_required
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        username = form.username.data
        email = form.email.data
        password = form.password.data

        try:
            UserModel.create_user(username, email, password)
            flash("Account created successfully!", "success")
            return redirect(url_for("user.login"))
        except Exception:
            flash("An error occurred. Please try again.", "danger")

    return render_template("register.html", form=form)

# ==============================
# LOGOUT
# ==============================
@user_bp.route("/logout")
@login_required
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("user.login"))