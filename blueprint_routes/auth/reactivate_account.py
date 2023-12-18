# Assuming 'current_user' is the authenticated user object
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.extensions import db
from models.user.user import User

auth_bp = Blueprint('auth_bp', __name__)
 
@auth_bp.route('/auth/reactivate-account', methods=['POST'])
@jwt_required()
def reactivate_account():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"message": "User not found"}), 404

    # Reactivate the user account logic here (e.g., update the user's status)
    current_user.is_active = True  # Adjust this based on your User model

    # Commit the changes to the database
    db.session.commit()

    return jsonify({"message": "Account reactivated successfully"}), 200
