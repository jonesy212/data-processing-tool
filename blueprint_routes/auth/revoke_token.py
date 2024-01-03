from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jsonify, jwt_required

from authentication.get_revoke_token import get_token_owner

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/auth/revoke-token', methods=['POST'])
def revoke_token():
    try:
        # Assuming you have a function to handle the actual token revocation in your authentication system
        # Replace the following line with your actual logic for revoking a user token
        # For demonstration purposes, we are assuming 'revoke_user_token' is a function
        # that takes user_id and token from the request and revokes the token
        user_id = request.json.get('user_id')
        token = request.json.get('token')

        if user_id is None or token is None:
            return jsonify({"message": "Both 'user_id' and 'token' are required"}), 400

        # Assume 'revoke_user_token' is a function that revokes the user token
        success = revoke_user_token(user_id, token)

        if success:
            return jsonify({"message": "Token revoked successfully"}), 200
        else:
            return jsonify({"message": "Failed to revoke token"}), 500

    except Exception as e:
        # Log the error or handle it based on your application needs
        return jsonify({"message": "An error occurred during token revocation"}), 500
# Assuming you have a list to store revoked tokens
revoked_tokens = set()

def is_token_revoked(jwt_payload):
    jti = jwt_payload['jti']
    return jti in revoked_tokens

# Endpoint to revoke a user's token
@auth_bp.route('/auth/revoke-token', methods=['POST'])
@jwt_required()
def revoke_user_token():
    try:
        current_user_id = get_jwt_identity()
        current_token_jti = get_jwt()['jti']

        # Check if the token is already revoked
        if is_token_revoked(get_jwt()):
            return jsonify({"message": "Token already revoked"}), 400

        # Additional security check: Ensure the token being revoked belongs to the current user
        if current_user_id != get_token_owner(current_token_jti):
            return jsonify({"message": "Unauthorized to revoke this token"})
        # Additional logic: Log the revocation or perform user-specific actions
        # For example, you might want to log the time of revocation
        revocation_time = datetime.utcnow()

        # Store the revoked token in the set
        revoked_tokens.add(current_token_jti)

        return jsonify({"message": "Token revoked successfully", "revocation_time": revocation_time}), 200

    except Exception as e:
        # Log the error or handle it based on your application needs
        return jsonify({"message": "An error occurred during token revocation"}), 500


