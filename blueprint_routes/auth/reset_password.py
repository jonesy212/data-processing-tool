# auth/auth_routes.py
import random
import string
from datetime import timedelta

from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash

from database.extensions import db
from models.user.user import User

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    reset_token = data.get('reset_token')
    new_password = data.get('new_password')

    if not email or not reset_token or not new_password:
        return jsonify({"message": "Email, reset token, and new password are required"}), 400

    user = User.query.filter_by(email=email, reset_token=reset_token).first()

    if not user:
        return jsonify({"message": "Invalid reset token or email"}), 401

    # Update the user's password
    user.password = generate_password_hash(new_password, method='sha256')
    user.reset_token = None
    db.session.commit()

    return jsonify({"message": "Password reset successfully"}), 200
