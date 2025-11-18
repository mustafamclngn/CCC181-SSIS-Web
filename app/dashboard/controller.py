from flask import Flask, render_template, Blueprint, request, flash, redirect, url_for
from app.models.dashboard import DashboardModel
from app.auth_decorators import login_required

dashboard_bp = Blueprint("dashboard", __name__, template_folder="templates")

# ==============================
# DASHBOARD
# ==============================
@dashboard_bp.route("/dashboard")
@login_required
def dashboard():
    data = DashboardModel.get_all_dashboard_data(top_limit=5)
    
    top_colleges = [
        (college['collegename'], college['student_count']) 
        for college in (data['top_colleges'] or [])
    ]
    
    top_programs = [
        (program['programname'], program['student_count']) 
        for program in (data['top_programs'] or [])
    ]
    
    return render_template(
        "dashboard.html",
        total_colleges=data['total_colleges'],
        total_programs=data['total_programs'],
        total_students=data['total_students'],
        top_colleges=top_colleges,
        top_programs=top_programs,
        college_statistics=data['college_statistics'],
    )