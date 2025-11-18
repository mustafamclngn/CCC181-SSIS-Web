from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField
from wtforms.validators import DataRequired, Regexp, EqualTo, Length, ValidationError
from app.database import get_db

class RegisterForm(FlaskForm):
    username = StringField(
        "Username",
        validators=[DataRequired(), Length(min=3, max=25)]
    )
    email = StringField(
        "Email",
        validators=[
            DataRequired(),
            Regexp(
                r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                message="Please enter a valid email address"
            ),
            Length(min=3, max=50)
        ]
    )
    password = PasswordField(
        "Password",
        validators=[DataRequired(), Length(min=6)]
    )
    confirm_password = PasswordField(
        "Confirm Password",
        validators=[DataRequired(), EqualTo("password", message="Passwords must match")]
    )
    submit = SubmitField("Register")

    def validate_username(self, username):
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT 1 FROM users WHERE username=%s", (username.data,))
        if cur.fetchone():
            cur.close()
            raise ValidationError("Username already taken.")
        cur.close()

    def validate_email(self, email):
        db = get_db()
        cur = db.cursor()
        cur.execute("SELECT 1 FROM users WHERE email=%s", (email.data,))
        if cur.fetchone():
            cur.close()
            raise ValidationError("Email already registered.")
        cur.close()

class LoginForm(FlaskForm):
    username = StringField("Username", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    remember_me = BooleanField("Remember Me")
    submit = SubmitField("Login")