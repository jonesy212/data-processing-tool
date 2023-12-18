from flask import Blueprint, jsonify, request

from authentication.auth import auth_bp

auth_bp = Blueprint('auth_bp', __name__)

# Mockup user data for demonstration
users_db = [
    {"id": 1, "username": "user1", "email": "user1@example.com"},
    {"id": 2, "username": "user2", "email": "user2@example.com"},
    {"id": 3, "username": "user3", "email": "user3@example.com"}
    # Add more user data as needed
]

@auth_bp.route('/auth/user-search', methods=['GET'])
def user_search():
    try:
        # Get search query from request parameters
        search_query = request.args.get('query', '').strip().lower()

        # Check if the search query is empty
        if not search_query:
            return jsonify({"message": "Please provide a search query"}), 400

        # Perform case-insensitive search in the mock user database
        matched_users = [
            user for user in users_db
            if search_query in user['username'].lower() or search_query in user['email'].lower()
        ]

        # Check if any users are found
        if not matched_users:
            return jsonify({"message": "No users found matching the search query"}), 404

        # Return the matched users
        return jsonify(matched_users)

    except Exception as e:
        # Log the error or handle it based on your application needs
        return jsonify({"message": "An error occurred during user search"}), 500
