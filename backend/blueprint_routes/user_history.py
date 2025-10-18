# user_history.py
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from models.user.user_history import UserHistory

user_history_bp = Blueprint('user_history_bp', __name__)

# Function to retrieve user history
@user_history_bp.route('/user-history', methods=['GET'])
@jwt_required()

def user_history():
    current_user_id = get_jwt_identity()
    user_history = UserHistory.query.filter_by(user_id=current_user_id).all()

    # Handle edge case: No user history found
    if not user_history:
        return jsonify({"message": "No user history found"}), 404

    # Serialize and return user history
    serialized_user_history = [{'action': entry.action, 'timestamp': entry.timestamp} for entry in user_history]
    return jsonify(serialized_user_history), 200
