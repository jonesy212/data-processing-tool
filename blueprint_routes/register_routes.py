# register_routes.py
from flask import (Blueprint, jsonify, redirect, render_template, request,
                   session, url_for)
from flask_limiter import Limiter
from werkzeug.security import generate_password_hash

from configs.config import app
from database.extensions import db
from models.user.get_remote_address import get_remote_address
from models.user.user import User
from models.user.user_activity_log import UserActivityLog

register_bp = Blueprint('register_bp', __name__)

limiter = Limiter(app, key_func=get_remote_address)

@register_bp.route('/register', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Check if the user already exists
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({'message': 'Username already exists'})

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

        # Log user registration activity
        UserActivityLog.log_activity(user_id=new_user.id, action='user_registered')

        # Save the hashed password in the session
        session['hashed_password'] = hashed_password

        # Redirect to login page
        return redirect(url_for('auth.verify_email'))

    return render_template('register.html')

# Include other routes if needed
