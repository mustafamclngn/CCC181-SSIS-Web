import os
import psycopg2
import config

from datetime import timedelta
from dotenv import load_dotenv
from flask import Flask, render_template, url_for, request, redirect, session
from flask_wtf.csrf import CSRFProtect

from app.database import get_db, close_db

from app.college import college_bp
from app.program import program_bp
from app.student import student_bp
from app.dashboard import dashboard_bp
from app.user import user_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["DATABASE_URL"] = config.DATABASE_URL
    app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=30)

    csrf = CSRFProtect(app)
    
    app.register_blueprint(college_bp)
    app.register_blueprint(program_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(user_bp)

    app.teardown_appcontext(close_db)

    @app.route("/")
    def home():
        if "user_id" in session:
            return redirect(url_for("dashboard.dashboard"))
        return redirect(url_for("user.login"))

    return app