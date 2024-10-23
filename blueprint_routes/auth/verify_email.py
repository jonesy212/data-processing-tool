from decode_and_verify_token import decode_and_verify_token
from flask import (Blueprint, flash, jsonify, redirect, render_template,
                   request, url_for)
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.extensions import db
from models.user.user import User

auth_bp = Blueprint('auth_bp', __name__)

# Function to handle email verification
@auth_bp.route('/auth/verify-email/<token>', methods=['GET', 'POST'])
@jwt_required(optional=True)
def verify_email(token):
    if request.method == 'GET':
        # Decode and verify the token (replace with your token verification logic)
        user_id = decode_and_verify_token(token)

        if not user_id:
            flash("Invalid verification token. Please try again.", "error")
            return jsonify({"message": "Invalid verification token. Please try again."}), 400

        # Mark the user's email as verified in the database
        user = User.query.get(user_id)
        if user:
            user.email_verified = True
            db.session.commit()

            flash("Email verification successful. You can now log in.", "success")
            return jsonify({"message": "Email verification successful. You can now log in."}), 200
        else:
            flash("User not found. Please register or contact support.", "error")
            return jsonify({"message": "User not found. Please register or contact support."}), 404
    
    elif request.method == 'POST':
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            flash("User not found.", "error")
            return jsonify({"message": "User not found."}), 404

        entered_code = request.form.get('verification_code')

        # Check if the entered verification code matches the stored code
        if entered_code == current_user.verification_code:
            # Verification successful, process the support request
            flash("Your support request has been received.", "success")
            return render_template('support_response.html', message="Your support request has been received.")
        else:
            flash("Invalid verification code. Please try again.", "error")
            return redirect(url_for('auth_bp.questionnaire')), 400
    
    return redirect(url_for('auth_bp.questionnaire'))
