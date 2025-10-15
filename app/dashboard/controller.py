from flask import Flask, render_template, Blueprint, request, flash, redirect, url_for
from app.models.dashboard import DashboardModel

dashboard_bp = Blueprint("dashboard", __name__, template_folder="templates")

# ==============================
# DASHBOARD
# ==============================
@dashboard_bp.route("/dashboard")
def dashboard():
    total_colleges = DashboardModel.get_total_colleges()
    total_programs = DashboardModel.get_total_programs()
    total_students = DashboardModel.get_total_students()
    top_colleges = DashboardModel.get_top_colleges(limit=5)
    top_programs = DashboardModel.get_top_programs(limit=5)
    college_statistics = DashboardModel.get_college_statistics()

    return render_template(
        "dashboard.html",
        total_colleges=total_colleges,
        total_programs=total_programs,
        total_students=total_students,
        top_colleges=top_colleges,
        top_programs=top_programs,
        college_statistics=college_statistics,
    )