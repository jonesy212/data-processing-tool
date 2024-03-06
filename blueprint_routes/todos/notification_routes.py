# notification_routes.py

from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models.notification.notification import Notification
from authentication.auth import get_authenticated_user_id  # Import the function

notification_bp = Blueprint('notification_bp', __name__)

@notification_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        # Get the ID of the authenticated user
        user_id = get_authenticated_user_id()

        # Fetch notifications for the authenticated user
        notifications = Notification.query.filter_by(user_id=user_id).all()

        # Serialize the list of notifications as needed
        serialized_notifications = [{'id': notification.id, 'message': notification.message, 'created_at': notification.created_at} for notification in notifications]

        return jsonify(serialized_notifications), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add more routes for CRUD operations on notifications as needed
