from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.validation.validate_notification_settings import \
    validate_notification_settings

# Assuming you have an 'auth_bp' Blueprint instance
auth_bp = Blueprint('auth_bp', __name__)
from flask import jsonify, request

from database.update_notification_settings_db import \
    update_notification_settings_db

# Assuming you have an 'auth_bp' Blueprint instance
auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/auth/update-notification-settings', methods=['PUT'])
def update_notification_settings():
    try:
        user_id = request.json.get('user_id')
        notification_settings = request.json.get('notification_settings')

        if user_id is None or notification_settings is None:
            return jsonify({"message": "Both 'user_id' and 'notification_settings' are required"}), 400

        if not validate_notification_settings(notification_settings):
            return jsonify({"message": "Invalid notification settings format"}), 400

        # Assume 'update_notification_settings_db' is a function that updates the database
        success = update_notification_settings_db(user_id, notification_settings)

        if success:
            return jsonify({"message": "Notification settings updated successfully"}), 200
        else:
            return jsonify({"message": "Failed to update notification settings"}), 500

    except Exception as e:
        # Log the error or handle it based on your application needs
        return jsonify({"message": "An error occurred during notification settings update"}), 500
