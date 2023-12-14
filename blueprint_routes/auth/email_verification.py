# auth/auth_routes.py
from flask import (Blueprint, flash, jsonify, redirect, render_template,
                   request, url_for)
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from database.extensions import db
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/auth/verify-email/<token>', methods=['GET', 'POST'])
def verify_email(email):
    if request.method == 'POST':
        entered_code = request.form.get('verification_code')

        # Check if the entered verification code matches the stored code
        stored_code = users_db[email].get('verification_code')
        if entered_code == stored_code:
            # Verification successful, process the support request
            return render_template('support_response.html', message="Your support request has been received.")
        else:
            flash("Invalid verification code. Please try again.")
    
    return redirect(url_for('auth.questionnaire'))








@auth_bp.route('/auth/resend-verification-email', methods=['POST'])
@jwt_required()
def resend_verification_email():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"message": "User not found"}), 404

    if current_user.email_verified:
        return jsonify({"message": "Email already verified"}), 400

    # Resend the verification email logic here (generate a new token and send the email)
    # Optionally, you can set a cooldown period to prevent spamming

    return jsonify({"message": "Verification email resent successfully"}), 200
