from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
@app.route("/dashboard")
def dashboard():
    return render_template("index.html")

@app.route("/colleges")
def colleges():
    colleges = [
        {"code": f"C{i:02d}", "name": f"College of Example {i}"}
        for i in range(1, 21)
    ]
    return render_template("colleges.html", colleges=colleges)

@app.route("/programs")
def programs():
    return render_template("programs.html")

@app.route("/students")
def students():
    return render_template("students.html")

if __name__ == "__main__":
    app.run(debug=True)
