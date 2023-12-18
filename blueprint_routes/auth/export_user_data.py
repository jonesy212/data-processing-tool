from flask import Blueprint, jsonify, request

# Assuming you have an 'auth_bp' Blueprint instance
auth_bp = Blueprint('auth_bp', __name__)

# Mockup user data for demonstration
users_db = [
    {"id": 1, "username": "user1", "email": "user1@example.com", "role": "admin"},
    {"id": 2, "username": "user2", "email": "user2@example.com", "role": "user"},
    {"id": 3, "username": "user3", "email": "user3@example.com", "role": "user"}
    # Add more user data as needed
]

@auth_bp.route('/auth/export-user-data', methods=['GET'])
def export_user_data():
    try:
        # export user data
        user_id = request.args.get('id')
        # In this example, we're just returning the mock user data
        user_data = [
            {"username": user['username'], "email": user['email'], "role": user['role']}
            for user in users_db
        ]

        # Check if any users are found
        if not user_data:
            return jsonify({"message": "No users found for exporting data"}), 404

        # Return the user data
        return jsonify(user_data)

    except Exception as e:
        # Log the error or handle it based on your application needs
        return jsonify({"message": "An error occurred during user data export"}), 500
