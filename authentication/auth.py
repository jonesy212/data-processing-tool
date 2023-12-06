# # Implement registration and login routes here
# auth.py
import hmac
import os

from flask import (Blueprint, Flask, jsonify, redirect, render_template,
                   request, session, url_for)
from flask_login import LoginManager, login_required, login_user, logout_user
from werkzeug.security import generate_password_hash

#todo set up JWT
# from flask_jwt import JWT , jwt_required, current_identity
from config import db
from models.user import User

auth_bp = Blueprint('auth', __name__)

# Callback functions for JWT
def authentication(username, password):
    user = User.query.filter_by(username=username).first()
    if user and hmac.compare_digest(user.password.encode('utf-8'), password.encode('utf-8')):
        return user

def identity(payload):
    user_id = payload('identity')
    return User.query.get(int(user_id))

#todo set up jwt
# jwt = JWT(auth_bp, authentication, identity)

login_manager = LoginManager()

def init_login_manager(app):
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
app = Flask(__name__)

app.secret_key = os.urandom(24)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.user_loader(lambda user_id: User.query.get(int(user_id)))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Check if passwords match
        if password != confirm_password:
            return render_template('register.html', message='Passwords do not match')

        # Hash the password before saving it
        hashed_password = generate_password_hash(password, method='sha256')

        # Create a new user instance
        new_user = User(username=username, email=email, password=hashed_password)

        # Add the user to the database
        db.session.add(new_user)
        db.session.commit()

        # Redirect to login page
        return redirect(url_for('login'))

    return render_template('register.html')


from models.user import User
