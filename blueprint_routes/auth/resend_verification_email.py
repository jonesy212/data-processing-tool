# resend_verification_email.py
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_mail import Message

from database.extensions import db
from database.Mail import mail
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

# Function to resend email verification for a user
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_mail import Message
from database.Mail import mail 
from database.extensions import db
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/auth/resend-verification-email', methods=['POST'])
@jwt_required()
def resend_verification_email():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"message": "User not found"}), 404

    if current_user.email_verified:
        return jsonify({"message": "Email already verified"}), 400

    # Generate a new verification token and update the user model
    verification_token = User.generate_verification_token()
    current_user.verification_token = verification_token
    db.session.commit()

    try:
        # Compose the email message
        subject = "Email Verification"
        body = f"Click the following link to verify your email: {request.url_root}auth/verify-email/{verification_token}"
        message = Message(subject=subject, recipients=[current_user.email], body=body)

        # Send the email using Flask-Mail instance
        mail.send(message)

        return jsonify({"message": "Verification email resent successfully"}), 200

    except Exception as e:
        current_app.logger.error(f"Error sending verification email: {str(e)}")
        return jsonify({"message": "Error sending verification email"}), 500


def send_verification_email(email, verification_token, subject="Email Verification", body=None):
    try:
        if not body:
            # Default body if not provided
            body = f"Click the following link to verify your email: {request.url_root}auth/verify-email/{verification_token}"

        # Compose the email message
        message = Message(subject=subject, recipients=[email], body=body)

        # Send the email using Flask-Mail instance
        mail.send(message)

    except Exception as e:
        current_app.logger.error(f"Error sending verification email: {str(e)}")
        # Log the error, and you might want to handle or log it differently based on your application needs
