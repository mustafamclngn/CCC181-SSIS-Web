from flask import Blueprint, render_template, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from app.database import get_db, close_db
from psycopg2.extras import RealDictCursor
from app.user.forms import RegisterForm, LoginForm

user_bp = Blueprint("user", __name__, template_folder="templates")

@user_bp.route("/login", methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data

        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT id, password FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        close_db()

        if user and check_password_hash(user[1], password):
            session["user_id"] = user[0]
            flash("Welcome back!", "success")
            return redirect(url_for("dashboard.dashboard"))
        else:
            flash("Invalid username or password.", "danger")

    return render_template("login.html", form=form)

@user_bp.route("/register", methods=["GET", "POST"])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        username = form.username.data
        email = form.email.data
        password = form.password.data

        db = get_db()
        cur = db.cursor()
        try:
            hashed = generate_password_hash(password)
            cur.execute(
                "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                (username, email, hashed),
            )
            db.commit()
            flash("Account created successfully!", "success")
            return redirect(url_for("user.login"))
        except Exception:
            db.rollback()
            flash("An error occurred. Please try again.", "danger")
        finally:
            cur.close()
            close_db()

    return render_template("register.html", form=form)

@user_bp.route("/logout")
def logout():
    session.clear()
    flash("You have been logged out.", "info")
    return redirect(url_for("user.login"))
