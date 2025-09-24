from flask import Flask, render_template

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)

    @app.route("/")
    @app.route("/dashboard")
    def dashboard():
        return render_template("dashboard.html")

    @app.route("/colleges")
    def colleges():
        colleges = [
            {"code": f"C{i:02d}", "name": f"College of Example {i}"}
            for i in range(1, 21)
        ]
        return render_template("colleges.html", colleges=colleges)

    @app.route("/programs")
    def programs():
        programs = [
            {
                "code": f"BS{i:02d}",
                "name": f"Bachelor of Science in Example {i}",
                "college_name": f"College of Example {((i - 1) % 5) + 1}"  # rotate colleges 1–5
            }
            for i in range(1, 21)
        ]
        return render_template("programs.html", programs=programs)

    @app.route("/students")
    def students():
        students = [
            {
                "idnumber": f"2025-{i:04d}",
                "first_name": f"First{i}",
                "last_name": f"Last{i}",
                "program_code": f"BS{((i - 1) % 5) + 1:02d}",  # rotate BS01–BS05
                "year_level": (i % 4) + 1,
                "gender": "Male" if i % 2 == 0 else "Female"
            }
            for i in range(1, 21)
        ]
        return render_template("students.html", students=students)

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