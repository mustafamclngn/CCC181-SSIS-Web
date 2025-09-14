from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def hello():
    return render_template("index.html")

@app.route("/about")
def about():
    return "My name is Muhamamd Mustafa M. Macalangan"

@app.route("/colleges")
def colleges():
    return render_template("colleges.html")

@app.route("/programs")
def programs():
    return render_template("programs.html")

@app.route("/students")
def students():
    return render_template("students.html")

if __name__ == "__main__":
    app.run(debug=True)
