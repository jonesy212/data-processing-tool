from datetime import datetime

from flask import Blueprint, g, request

tracker_bp = Blueprint('tracker_bp', __name__)

from datetime import datetime


class NotificationTracker:
    def __init__(self):
        self.notifications = []  # Use a list to store notification details

    def send_notification(self, user_id, message):
        # Generate a unique notification ID (you can use a more sophisticated method)
        notification_id = f"notification_{len(self.notifications) + 1}"
        
        # Store notification details in the list
        self.notifications.append({
            'notification_id': notification_id,
            'user_id': user_id,
            'message': message,
            'timestamp': datetime.utcnow()
            # Add additional fields as needed
        })
        return notification_id

    def edit_notification(self, notification_id, new_message):
        # Check if the notification_id is valid
        for notification in self.notifications:
            if notification['notification_id'] == notification_id:
                # Update the message of the notification
                notification['message'] = new_message
                return True
        return False  # Invalid notification_id

    def get_notification_details(self, notification_id):
        # Return details of a specific notification
        for notification in self.notifications:
            if notification['notification_id'] == notification_id:
                return notification
        return None  # Notification not found

    def get_all_notifications(self):
        # Return details of all notifications
        return self.notifications

# Create an instance of the NotificationTracker
notification_tracker = NotificationTracker()

# Sample usage in a route
@tracker_bp.route('/send-notification/<message>/<notification_type>')
def send_notification(message, notification_type):
    notification_tracker.track_notification(message, notification_type)
    return f"Sent {notification_type} Notification: {message}"
