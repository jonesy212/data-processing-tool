# auth/auth_routes.py
import random
import string

from flask import Blueprint, jsonify, request

from database.extensions import db
from models.user.user import User

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email')

    if not email:
        return jsonify({"message": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Generate a random password reset token
    reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=30))
    user.reset_token = reset_token
    db.session.commit()

    # Send the reset token to the user (implement your email sending logic here)

    return jsonify({"message": "Reset token sent successfully"}), 200
