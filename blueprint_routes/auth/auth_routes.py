# auth_routes.py
from auth import (change_password, forgot_password, resend_verification_email,
                  reset_password, update_profile, verify_email)
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (create_access_token, get_jwt_identity,
                                jwt_required)
from werkzeug.security import check_password_hash, generate_password_hash

from database.extensions import db
from models.user import User

auth_bp = Blueprint('auth_bp', __name__)


auth_bp.add_url_rule('/auth/forgot-password', 'forgot_password', forgot_password, methods=['POST'])
auth_bp.add_url_rule('/auth/reset-password', 'reset_password', reset_password, methods=['POST'])
auth_bp.add_url_rule('/auth/verify-email/<token>', 'verify_email', verify_email, methods=['GET'])
auth_bp.add_url_rule('/auth/resend-verification-email', 'resend_verification_email', resend_verification_email, methods=['POST'])
auth_bp.add_url_rule('/auth/change-password', 'change_password', change_password, methods=['PUT'])
# User Authentication Routes- good for setting routes dynamically
auth_bp.add_url_rule('/auth/update-profile', 'update_profile', update_profile, methods=['PUT'])
auth_bp.add_url_rule('/auth/deactivate-account', 'deactivate_account', deactivate_account, methods=['DELETE'])
auth_bp.add_url_rule('/auth/reactivate-account', 'reactivate_account', reactivate_account, methods=['POST'])
auth_bp.add_url_rule('/auth/user-history', 'user_history', user_history, methods=['GET'])
auth_bp.add_url_rule('/auth/oauth-login', 'oauth_login', oauth_login, methods=['POST'])
auth_bp.add_url_rule('/auth/setup-2fa', 'setup_2fa', setup_2fa, methods=['POST'])
auth_bp.add_url_rule('/auth/verify-2fa', 'verify_2fa', verify_2fa, methods=['POST'])
auth_bp.add_url_rule('/auth/user-roles-permissions', 'user_roles_permissions', user_roles_permissions, methods=['GET'])
auth_bp.add_url_rule('/auth/user-activity-log', 'user_activity_log', user_activity_log, methods=['GET'])
auth_bp.add_url_rule('/auth/user-search', 'user_search', user_search, methods=['GET'])
auth_bp.add_url_rule('/auth/export-user-data', 'export_user_data', export_user_data, methods=['GET'])
auth_bp.add_url_rule('/auth/update-notification-settings', 'update_notification_settings', update_notification_settings, methods=['PUT'])
auth_bp.add_url_rule('/auth/update-privacy-settings', 'update_privacy_settings', update_privacy_settings, methods=['PUT'])
auth_bp.add_url_rule('/auth/upload-avatar', 'upload_avatar', upload_avatar, methods=['POST'])
auth_bp.add_url_rule('/auth/revoke-token', 'revoke_token', revoke_token, methods=['POST'])



@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Serialize the user data as needed
    serialized_user = {'id': user.id, 'username': user.username, 'email': user.email}

    return jsonify(serialized_user), 200
