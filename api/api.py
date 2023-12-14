from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from configs.config import app
from models.user import User


@app.route('/api/user/profile-picture')
@jwt_required()
def get_profile_picture():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if user and user.profile_picture_url:
        return jsonify({'profilePictureUrl': user.profile_picture_url})
    else:
        return jsonify({'profilePictureUrl': None})
