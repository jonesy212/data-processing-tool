# setup_2fa.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_otp import OTP

from database.extensions import db
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

# Function to set up two-factor authentication for a user
@auth_bp.route('/auth/setup-2fa', methods=['POST'])
@jwt_required()
def setup_2fa():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"message": "User not found"}), 404

    # Generate a secret key for two-factor authentication
    otp = OTP()
    secret = otp.generate_secret()
    
    # Save the secret key in the user's profile (you may want to encrypt and store securely)
    current_user.two_factor_secret = secret

    # Commit changes to the database
    db.session.commit()

    return jsonify({"message": "Two-factor authentication set up successfully", "secret": secret}), 200
