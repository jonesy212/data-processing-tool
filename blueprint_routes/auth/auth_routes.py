# auth_routes.py
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from blueprint_routes.auth.user_activity_log import user_activity_log
from blueprint_routes.auth.user_history import user_history

user_history
from blueprint_routes.auth.change_password import change_password
from blueprint_routes.auth.deactivate_account import deactivate_account
from blueprint_routes.auth.export_user_data import export_user_data
from blueprint_routes.auth.forgot_password import forgot_password
from blueprint_routes.auth.oauth_login import oauth_login
from blueprint_routes.auth.reactivate_account import reactivate_account
from blueprint_routes.auth.resend_verification_email import \
    resend_verification_email
from blueprint_routes.auth.reset_password import reset_password
from blueprint_routes.auth.revoke_token import revoke_user_token
from blueprint_routes.auth.setup_2fa import setup_2fa
from blueprint_routes.auth.update_notification_settings import \
    update_notification_settings
from blueprint_routes.auth.update_privacy_settings import \
    update_privacy_settings_db
from blueprint_routes.auth.update_profile import update_profile
from blueprint_routes.auth.upload_avatar import upload_avatar
from blueprint_routes.auth.user_roles_permissisons_route import \
    user_roles_permissions_route
from blueprint_routes.auth.user_search import user_search
from blueprint_routes.auth.verify_2fa import verify_2fa
from blueprint_routes.auth.verify_email import verify_email
from database.extensions import db
from models.user.user import User

auth_bp = Blueprint('auth_bp', __name__)

auth_bp.add_url_rule('/auth/forgot-password', 'forgot_password', forgot_password, methods=['POST'])
auth_bp.add_url_rule('/auth/reset-password', 'reset_password', reset_password, methods=['POST'])
auth_bp.add_url_rule('/auth/verify-email/<token>', 'verify_email', verify_email, methods=['GET'])
auth_bp.add_url_rule('/auth/resend-verification-email', 'resend_verification_email', resend_verification_email, methods=['POST'])
auth_bp.add_url_rule('/auth/change-password', 'change_password', change_password, methods=['PUT'])
auth_bp.add_url_rule('/auth/update-profile', 'update_profile', update_profile, methods=['PUT'])
auth_bp.add_url_rule('/auth/deactivate-account', 'deactivate_account', deactivate_account, methods=['DELETE'])
auth_bp.add_url_rule('/auth/reactivate-account', 'reactivate_account', reactivate_account, methods=['POST'])
auth_bp.add_url_rule('/auth/user-history', 'user_history', user_history, methods=['GET'])
# User Authentication Routes- good for setting routes dynamically
auth_bp.add_url_rule('/auth/oauth-login', 'oauth_login', oauth_login, methods=['POST'])
auth_bp.add_url_rule('/auth/setup-2fa', 'setup_2fa', setup_2fa, methods=['POST'])
auth_bp.add_url_rule('/auth/verify-2fa', 'verify_2fa', verify_2fa, methods=['POST'])
auth_bp.add_url_rule('/auth/user-roles-permissions', 'user_roles_permissions_route', user_roles_permissions_route, methods=['GET'])
auth_bp.add_url_rule('/auth/user-activity-log', 'user_activity_log', user_activity_log, methods=['GET'])
auth_bp.add_url_rule('/auth/user-search', 'user_search', user_search, methods=['GET'])
auth_bp.add_url_rule('/auth/export-user-data', 'export_user_data', export_user_data, methods=['GET'])
auth_bp.add_url_rule('/auth/update-notification-settings', 'update_notification_settings', update_notification_settings, methods=['PUT'])
auth_bp.add_url_rule('/auth/update-privacy-settings', 'update_privacy_settings', update_privacy_settings_db, methods=['PUT'])
auth_bp.add_url_rule('/auth/upload-avatar', 'upload_avatar', upload_avatar, methods=['POST'])
auth_bp.add_url_rule('/auth/revoke-token', 'revoke_token', revoke_user_token, methods=['POST'])



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
