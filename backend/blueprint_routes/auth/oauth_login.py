# oauth_login.py
from flask import Blueprint, jsonify, request

from database.extensions import db
from models.user import User  # Assuming you have a User model

oauth_login_bp = Blueprint('oauth_login_bp', __name__)

# Function to handle OAuth login
@oauth_login_bp.route('/auth/oauth-login', methods=['POST'])
def oauth_login():
    data = request.json

    # Handle edge case: Missing required data
    if not all(key in data for key in ['oauth_provider', 'oauth_token']):
        return jsonify({"message": "Missing required data"}), 400
    # todo verif if we can us any other content from auth here.
    # Perform OAuth login logic here, e.g., validate token, retrieve user information

    # Handle edge case: User not found in the database
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        # Create a new user account if not found
        user = User(email=data['email'], username=data.get('username', data['email']))
        db.session.add(user)
        db.session.commit()

    # Return user information or a token as needed
    return jsonify({"message": "OAuth login successful", "user_id": user.id}), 200
