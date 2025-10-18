# user_roles_permissions.py
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from models.user import User

auth_bp = Blueprint('auth_bp', __name__)

# Function to get user roles and permissions
@auth_bp.route('/auth/user-roles-permissions', methods=['GET'])
@jwt_required()
def user_roles_permissions_route():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"message": "User not found"}), 404

    # Assuming you have roles and permissions attributes in your User model
    roles = current_user.roles
    permissions = current_user.permissions

    return jsonify({"roles": roles, "permissions": permissions}), 200
