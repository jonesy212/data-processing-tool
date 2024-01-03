
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from authentication.auth import auth_bp
from database.extensions import db


@auth_bp.route('/auth/create-notification', methods=['POST'])
@jwt_required()
def create_notification():
    try:
        current_user_id = get_jwt_identity()
        notification_data = request.json.get('notification_data')

        if not notification_data:
            return jsonify({"message": "Notification data is required"}), 400

        # You can add custom validation for notification_data based on your requirements
        # Example: if not validate_notification_data(notification_data):
        #            return jsonify({"message": "Invalid notification data format"}), 400

        notification = Notification(
            user_id=current_user_id,
            content=notification_data.get('content'),
            type=notification_data.get('type'),
            # Add more fields as needed
        )

        db.session.add(notification)
        db.session.commit()

        return jsonify({"message": "Notification created successfully"}), 201

    except Exception as e:
        # Log the error or handle it based on your application needs
        print(f"An error occurred during notification creation: {str(e)}")
        return jsonify({"message": "Failed to create notification"}), 500