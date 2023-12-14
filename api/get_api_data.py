#get_api_data.py
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from configs.config import app
from models.user import User

# Define API versions
API_VERSION_V1 = 'application/vnd.yourapp.v1+json'
API_VERSION_V2 = 'application/vnd.yourapp.v2+json'

# Sample data for demonstration
data_v1 = {'message': 'This is version 1 of the API'}
data_v2 = {'message': 'This is version 2 of the API'}

# Endpoint with Header Versioning
@app.route('/api/data', methods=['GET'])
def get_data():
    # Get the requested API version from the Accept header
    requested_version = request.headers.get('Accept')

    # Determine the data to return based on the requested version
    if requested_version == API_VERSION_V1:
        return jsonify(data_v1), 200
    elif requested_version == API_VERSION_V2:
        return jsonify(data_v2), 200
    else:
        return jsonify({'message': 'Invalid API version requested'}), 400






@app.route('/api/user/profile-picture')
@jwt_required()
def get_profile_picture():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user and user.profile_picture_url:
        return jsonify({'profilePictureUrl': user.profile_picture_url})
    else:
        return jsonify({'profilePictureUrl': None})