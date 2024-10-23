from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from werkzeug.security import check_password_hash, generate_password_hash

from blueprint_routes import user_history
from blueprint_routes.auth import (change_password, deactivate_account,
                                   export_user_data, forgot_password,
                                   oauth_login, reactivate_account,
                                   resend_verification_email, reset_password,
                                   setup_2fa, update_notification_settings,
                                   update_privacy_settings, update_profile,
                                   upload_avatar, user_activity_log,
                                   user_search, verify_2fa, verify_email)
from blueprint_routes.auth.revoke_token import revoke_user_token
from blueprint_routes.auth.user_roles_permissisons_route import \
    user_roles_permissions_route
from database.extensions import db
from models.user.user import User
from state.stores.template_engine import render_template

auth_bp = Blueprint('auth_bp', __name__)

# Helper function to create URL rules
def add_auth_url_rule(rule, endpoint, view_func, methods=['GET']):
    auth_bp.add_url_rule(rule, endpoint, view_func, methods=methods)

# Authentication Routes
add_auth_url_rule('/auth/forgot-password', 'forgot_password', forgot_password, methods=['POST'])
add_auth_url_rule('/auth/reset-password', 'reset_password', reset_password, methods=['POST'])
add_auth_url_rule('/auth/verify-email/<token>', 'verify_email', verify_email, methods=['GET'])
add_auth_url_rule('/auth/resend-verification-email', 'resend_verification_email', resend_verification_email, methods=['POST'])
add_auth_url_rule('/auth/change-password', 'change_password', change_password, methods=['PUT'])
add_auth_url_rule('/auth/update-profile', 'update_profile', update_profile, methods=['PUT'])
add_auth_url_rule('/auth/deactivate-account', 'deactivate_account', deactivate_account, methods=['DELETE'])
add_auth_url_rule('/auth/reactivate-account', 'reactivate_account', reactivate_account, methods=['POST'])
add_auth_url_rule('/auth/user-history', 'user_history', user_history, methods=['GET'])
add_auth_url_rule('/auth/oauth-login', 'oauth_login', oauth_login, methods=['POST'])
add_auth_url_rule('/auth/setup-2fa', 'setup_2fa', setup_2fa, methods=['POST'])
add_auth_url_rule('/auth/verify-2fa', 'verify_2fa', verify_2fa, methods=['POST'])
add_auth_url_rule('/auth/user-roles-permissions', 'user_roles_permissions_route', user_roles_permissions_route, methods=['GET'])
add_auth_url_rule('/auth/user-activity-log', 'user_activity_log', user_activity_log, methods=['GET'])
add_auth_url_rule('/auth/user-search', 'user_search', user_search, methods=['GET'])
add_auth_url_rule('/auth/export-user-data', 'export_user_data', export_user_data, methods=['GET'])
add_auth_url_rule('/auth/update-notification-settings', 'update_notification_settings', update_notification_settings, methods=['PUT'])
add_auth_url_rule('/auth/update-privacy-settings', 'update_privacy_settings', update_privacy_settings, methods=['PUT'])
add_auth_url_rule('/auth/upload-avatar', 'upload_avatar', upload_avatar, methods=['POST'])
add_auth_url_rule('/auth/revoke-token', 'revoke_token', revoke_user_token, methods=['POST'])

# User Profile Route
@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Serialize the user data as needed
        serialized_user = {'id': user.id, 'username': user.username, 'email': user.email}

        return jsonify(serialized_user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# auth_routes.py
@auth_bp.route('/verify-email', methods=['GET'])
def verify_email():
    return render_template('verify_email.html')

@auth_bp.route('/logout', methods=['GET'])
@jwt_required()
def logout():
    # Handle logout logic here, e.g., clearing session or JWT token
    return jsonify({'message': 'Logout successful'})

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        data = request.get_json()
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        confirm_password = data.get('confirm_password')

        # Check if the old password matches
        if not check_password_hash(user.password, old_password):
            return jsonify({"error": "Incorrect old password"}), 400

        # Check if the new password and confirm password match
        if new_password != confirm_password:
            return jsonify({"error": "New passwords do not match"}), 400

        # Hash the new password before saving it
        hashed_password = generate_password_hash(new_password, method='sha256')
        user.password = hashed_password

        # Update the user in the database
        db.session.commit()

        return jsonify({'message': 'Password changed successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ... (other routes)
