from auth.auth_routes import auth_bp
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from notifications.create_notification import create_notification

from blueprint_routes.auth.update_notification_settings import \
    update_notification_settings
from blueprint_routes.notifications.notification_routes import notification_bp
from database.extensions import db
from database.update_notification_settings_db import \
    update_notification_settings_db
from database.validation.validate_notification_settings import \
    validate_notification_settings
from models.notification.notification import Notification
from models.user.user import User

notification_bp = Blueprint('notification_bp', __name__)

# Dynamic creation of routes
notification_routes = [
 ('/notifications/update-settings', 'update_notification_settings', update_notification_settings, ['PUT']),
    ('/notifications/create-notification', 'create_notification', create_notification, ['POST']),
       # Add other notification routes as needed
]

@notification_bp.route('/notifications/update-settings', methods=['PUT'])
@jwt_required()
def update_notification_settings_route():
    try:
        user_id = get_jwt_identity()
        notification_settings = request.json.get('notification_settings')

        if notification_settings is None:
            return jsonify({"message": "'notification_settings' is required"}), 400

        if not validate_notification_settings(notification_settings):
            return jsonify({"message": "Invalid notification settings format"}), 400

        success = update_notification_settings_db(user_id, notification_settings)

        if success:
            return jsonify({"message": "Notification settings updated successfully"}), 200
        else:
            return jsonify({"message": "Failed to update notification settings"}), 500

    except Exception as e:
        # Log the error or handle it based on your application needs
        return jsonify({"message": "An error occurred during notification settings update"}), 500





@notification_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Serialize the user data as needed
    serialized_user = {'id': user.id, 'username': user.username, 'email': user.email}

    return jsonify(serialized_user), 200








@auth_bp.route('/auth/get-notification-settings', methods=['GET'])
@jwt_required()
def get_notification_settings():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Get and return the user's notification settings
        return jsonify(user.notification_settings), 200

    except Exception as e:
        # Log the error or handle it based on your application needs
        return jsonify({"message": "An error occurred while fetching notification settings"}), 500





@auth_bp.route('/auth/toggle-notification', methods=['PUT'])
@jwt_required()
def toggle_notification():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"message": "User not found"}), 404

        notification_type = request.json.get('notification_type')
        if not notification_type:
            return jsonify({"message": "'notification_type' is required"}), 400

        # Toggle the specified notification type (e.g., email, sms, push)
        user.notification_settings[notification_type] = not user.notification_settings.get(notification_type, False)

        # Commit changes to the database
        db.session.commit()

        return jsonify({"message": f"{notification_type} notification toggled successfully"}), 200

    except Exception as e:
        # Log the error or handle it based on your application needs
        return jsonify({"message": "An error occurred while toggling notification"}), 500




@auth_bp.route('/auth/mark-notifications-read', methods=['PUT'])
@jwt_required()
def mark_notifications_read():
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with a field 'read' representing the read status
    unread_notifications = Notification.query.filter_by(user_id=current_user_id, read=False).all()

    for notification in unread_notifications:
        notification.read = True

    db.session.commit()

    return jsonify({"message": "All notifications marked as read"}), 200



@auth_bp.route('/auth/delete-notification/<int:notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with an 'id' field
    notification_to_delete = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()

    if notification_to_delete:
        db.session.delete(notification_to_delete)
        db.session.commit()
        return jsonify({"message": "Notification deleted successfully"}), 200
    else:
        return jsonify({"message": "Notification not found or does not belong to the user"}), 404






@auth_bp.route('/auth/unread-notifications-count', methods=['GET'])
@jwt_required()
def get_unread_notifications_count():
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with a 'read' field
    unread_count = Notification.query.filter_by(user_id=current_user_id, read=False).count()

    return jsonify({"unread_count": unread_count}), 200





@auth_bp.route('/auth/get-all-notifications', methods=['GET'])
@jwt_required()
def get_all_notifications():
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with relevant fields
    user_notifications = Notification.query.filter_by(user_id=current_user_id).all()

    # Serialize notifications as needed
    serialized_notifications = [{"id": n.id, "message": n.message, "timestamp": n.timestamp} for n in user_notifications]

    return jsonify({"notifications": serialized_notifications}), 200




@auth_bp.route('/auth/send-broadcast-notification', methods=['POST'])
@jwt_required()
def send_broadcast_notification():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # Assuming you have an admin role or specific permissions to send broadcast notifications
    if user.has_admin_role():
        data = request.json
        message = data.get('message')

        # Broadcast the notification to all users
        users = User.query.all()
        for u in users:
            notification = Notification(user_id=u.id, message=message)
            db.session.add(notification)

        db.session.commit()
        return jsonify({"message": "Broadcast notification sent successfully"}), 200
    else:
        return jsonify({"message": "Permission denied. User is not authorized to send broadcast notifications"}), 403




@auth_bp.route('/auth/get-notifications-by-type/<notification_type>', methods=['GET'])
@jwt_required()
def get_notifications_by_type(notification_type):
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with a 'type' field
    user_notifications = Notification.query.filter_by(user_id=current_user_id, type=notification_type).all()

    # Serialize notifications as needed
    serialized_notifications = [{"id": n.id, "message": n.message, "timestamp": n.timestamp} for n in user_notifications]

    return jsonify({"notifications": serialized_notifications}), 200




@auth_bp.route('/auth/mark-notification-as-read/<notification_id>', methods=['PUT'])
@jwt_required()
def mark_notification_as_read(notification_id):
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with a 'read' field
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()

    if notification:
        notification.read = True
        db.session.commit()
        return jsonify({"message": "Notification marked as read"}), 200
    else:
        return jsonify({"message": "Notification not found or permission denied"}), 404




@auth_bp.route('/auth/delete-notification/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with relevant fields
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()

    if notification:
        db.session.delete(notification)
        db.session.commit()
        return jsonify({"message": "Notification deleted successfully"}), 200
    else:
        return jsonify({"message": "Notification not found or permission denied"}), 404
@auth_bp.route('/auth/delete-all-notifications', methods=['DELETE'])
@jwt_required()
def delete_all_notifications():
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with relevant fields
    user_notifications = Notification.query.filter_by(user_id=current_user_id).all()

    for notification in user_notifications:
        db.session.delete(notification)

    db.session.commit()
    return jsonify({"message": "All notifications deleted successfully"}), 200
@auth_bp.route('/auth/delete-notification/<notification_id>', methods=['DELETE'])
@jwt_required()
def delete_notification(notification_id):
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with relevant fields
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()

    if notification:
        db.session.delete(notification)
        db.session.commit()
        return jsonify({"message": "Notification deleted successfully"}), 200
    else:
        return jsonify({"message": "Notification not found or permission denied"}), 404



@auth_bp.route('/auth/mark-notification-as-read/<notification_id>', methods=['PUT'])
@jwt_required()
def mark_notification_as_read(notification_id):
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with a 'read' field
    notification = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()

    if notification:
        notification.read = True
        db.session.commit()
        return jsonify({"message": "Notification marked as read"}), 200
    else:
        return jsonify({"message": "Notification not found or permission denied"}), 404



@auth_bp.route('/auth/get-notifications-by-type/<notification_type>', methods=['GET'])
@jwt_required()
def get_notifications_by_type(notification_type):
    current_user_id = get_jwt_identity()

    # Assuming you have a 'Notification' model with a 'type' field
    user_notifications = Notification.query.filter_by(user_id=current_user_id, type=notification_type).all()

    # Serialize notifications as needed
    serialized_notifications = [{"id": n.id, "message": n.message, "timestamp": n.timestamp} for n in user_notifications]

    return jsonify({"notifications": serialized_notifications}), 200
