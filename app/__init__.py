import os
import psycopg2
import config

from dotenv import load_dotenv
from flask import Flask, render_template, url_for, request, redirect, session

from app.database import get_db, close_db

from app.college import college_bp
from app.program import program_bp
from app.student import student_bp
from app.dashboard import dashboard_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = config.SECRET_KEY
    app.config["DATABASE_URL"] = config.DATABASE_URL
    
    app.register_blueprint(college_bp)
    app.register_blueprint(program_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(dashboard_bp)

    # @app.route("/")
    # @app.route("/dashboard")
    # def dashboard():
    #     return render_template("dashboard.html")

    @app.route("/login")
    def login():
        return render_template("login.html")

    @app.route("/register")
    def register():
        return render_template("register.html")

    @app.route("/users")
    def users():
        return render_template("users.html")

    return app
