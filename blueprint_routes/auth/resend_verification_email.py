# resend_verification_email.py
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_mail import Message

from database.extensions import db, mail
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

# Function to resend email verification for a user
@auth_bp.route('/auth/resend-verification-email', methods=['POST'])
@jwt_required()
def resend_verification_email():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"message": "User not found"}), 404

    # Check if the user has already been verified
    if current_user.is_verified:
        return jsonify({"message": "User is already verified"}), 400

    # Generate a new verification token and update the user model
    verification_token = User.generate_verification_token()
    current_user.verification_token = verification_token
    db.session.commit()

    # Send the verification email
    send_verification_email(current_user.email, verification_token)

    return jsonify({"message": "Verification email resent successfully"}), 200


def send_verification_email(email, verification_token):
    try:
        # Compose the email message
        subject = "Email Verification"
        body = f"Click the following link to verify your email: {request.url_root}auth/verify-email/{verification_token}"
        message = Message(subject=subject, recipients=[email], body=body)

        # Send the email
        mail.send(message)

    except Exception as e:
        current_app.logger.error(f"Error sending verification email: {str(e)}")
        # Log the error, and you might want to handle or log it differently based on your application needs