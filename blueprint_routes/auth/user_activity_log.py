# user_activity_log.py
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from models.user.user_activity_log import \
    UserActivityLog  # Assuming you have a UserActivityLog model

auth_bp = Blueprint('auth_bp', __name__)

# Function to get user activity log
@auth_bp.route('/auth/user-activity-log', methods=['GET'])
@jwt_required()
def user_activity_log():
    current_user_id = get_jwt_identity()
    user_activity_log_entries = UserActivityLog.query.filter_by(user_id=current_user_id).all()

    # Handle edge case: No user activity log found
    if not user_activity_log_entries:
        return jsonify({"message": "No user activity log found"}), 404

    # Serialize and return user activity log
    serialized_user_activity_log = [
        {'action': entry.action, 'timestamp': entry.timestamp} for entry in user_activity_log_entries
    ]

    return jsonify(serialized_user_activity_log), 200
