
from decode_and_verify_token import decode_and_verify_token
from flask import (Blueprint, flash, jsonify, redirect, render_template,
                   request, url_for)
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.extensions import db
from models.user.user import User

auth_bp = Blueprint('auth_bp', __name__)

# Function to handle email verification
@auth_bp.route('/auth/verify-email/<token>', methods=['GET'])
def verify_email(token):
    # Decode and verify the token (replace with your token verification logic)
    user_id = decode_and_verify_token(token)

    if not user_id:
        flash("Invalid verification token. Please try again.")
        return redirect(url_for('auth.login'))  # Redirect to login page or another appropriate page

    # Mark the user's email as verified in the database
    user = User.query.get(user_id)
    if user:
        user.email_verified = True
        db.session.commit()

        flash("Email verification successful. You can now log in.")
        return redirect(url_for('auth.login'))  # Redirect to login page or another appropriate page
    else:
        flash("User not found. Please register or contact support.")
        return redirect(url_for('auth.login'))  # Redirect to login page or another appropriate page
