
from flask import (Blueprint, flash, jsonify, redirect, render_template,
                   request, url_for)
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from database.extensions import db
from models.user.user import User

auth_bp = Blueprint('auth_bp', __name__)

# Function to update user profile
@auth_bp.route('/auth/update-profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"message": "User not found"}), 404

    # Get updated profile data from the request
    updated_data = request.json

    # Update user profile information
    current_user.username = updated_data.get('username', current_user.username)
    current_user.email = updated_data.get('email', current_user.email)

    # Optionally, update other profile fields as needed

    # Commit changes to the database
    db.session.commit()

    # Return a response with the updated user profile
    serialized_user = {'id': current_user.id, 'username': current_user.username, 'email': current_user.email}
    return jsonify(serialized_user), 200
