from datetime import datetime, timedelta

from flask import jsonify, request
from flask_jwt_extended import decode_token, get_jwt_identity, jwt_required

from blueprint_routes.auth.revoke_token import is_token_revoked
from configs.config import app
from models.user.user import User


@app.route('/generate-transfer-token', methods=['POST'])
def generate_transfer_token():
    # Generate the transferToken (example: using JWT)
    transfer_token = generate_transfer_token_somehow() 
    return jsonify({'transferToken': transfer_token}), 200

@app.route('/api/user/profile-picture')
@jwt_required()
def get_profile_picture():
    try:
        raw_jwt_token = request.headers.get('Authorization').split()[1]

        # Decode the token using Flask-JWT-Extended
        decoded_token = decode_token(raw_jwt_token)

        # Check if the token has expired
        current_time = datetime.utcnow()
        expiration_time = datetime.utcfromtimestamp(decoded_token['exp'])
        token_validity = expiration_time - current_time

        if token_validity < timedelta(seconds=0):
            # Token has expired, handle accordingly (e.g., force reauthentication)
            return jsonify({'profilePictureUrl': None}), 401

        # Check if the token has been revoked
        if is_token_revoked(decoded_token):
            # Token has been revoked, handle accordingly
            return jsonify({'profilePictureUrl': None}), 401

        # Get the current user ID from the token
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user and user.profile_picture_url:
            return jsonify({'profilePictureUrl': user.profile_picture_url})
        else:
            return jsonify({'profilePictureUrl': None})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
