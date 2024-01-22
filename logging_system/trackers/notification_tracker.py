from datetime import datetime

from flask import Blueprint

tracker_bp = Blueprint('tracker_bp', __name__)

class NotificationTracker:
    def __init__(self):
        self.notifications = []

    def send_notification(self, user_id, message):
        notification_id = f"notification_{len(self.notifications) + 1}"
        self.notifications.append({
            'notification_id': notification_id,
            'user_id': user_id,
            'message': message,
            'timestamp': datetime.utcnow()
        })
        return notification_id

    def edit_notification(self, notification_id, new_message):
        for notification in self.notifications:
            if notification['notification_id'] == notification_id:
                notification['message'] = new_message
                return True
        return False

    def get_notification_details(self, notification_id):
        for notification in self.notifications:
            if notification['notification_id'] == notification_id:
                return notification
        return None

    def get_all_notifications(self):
        return self.notifications

notification_tracker = NotificationTracker()

@tracker_bp.route('/send-notification/<user_id>/<message>', methods=['POST'])
def send_notification(user_id, message):
    notification_id = notification_tracker.send_notification(user_id, message)
    return {'notification_id': notification_id, 'message': f"Sent Notification: {message}"}
