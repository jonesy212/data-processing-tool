# auth/auth_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from database.extensions import db
from models.user.user import User

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/auth/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            return jsonify({"message": "User not found"}), 404

        data = request.json
        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({"message": "Current password and new password are required"}), 400

        if not check_password_hash(current_user.password, current_password):
            return jsonify({"message": "Incorrect current password"}), 401

        # Update the user's password
        hashed_new_password = generate_password_hash(new_password, method='sha256')
        current_user.password = hashed_new_password
        db.session.commit()

        return jsonify({"message": "Password changed successfully"}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
