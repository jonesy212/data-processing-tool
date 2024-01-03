# verify_2fa.py
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_otp import OTP

from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

# Function to verify two-factor authentication for a user
@auth_bp.route('/auth/verify-2fa', methods=['POST'])
@jwt_required()
def verify_2fa():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"message": "User not found"}), 404

    # Get the OTP token from the request
    token = request.json.get('token')

    try:
        # Verify the OTP token
        otp = OTP()
        is_valid = otp.verify_token(current_user.two_factor_secret, token)

        if is_valid:
            return jsonify({"message": "Two-factor authentication successful"}), 200
        else:
            return jsonify({"message": "Invalid two-factor authentication token"}), 401

    except Exception as e:
        current_app.logger.error(f"Error verifying 2FA token: {str(e)}")
        return jsonify({"message": "Internal server error"}), 500
