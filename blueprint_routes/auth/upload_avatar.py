import imghdr

from flask import Blueprint, jsonify, request

from database.extensions import db
from dataset.dataset_upload import allowed_file
from models.user import User

# Assuming you have an 'auth_bp' Blueprint instance
auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/auth/upload-avatar', methods=['POST'])
def upload_avatar():
    try:
        # Assuming you have a function to handle the actual avatar upload and update in your database
        # Replace the following line with your actual logic for uploading an avatar
        # For demonstration purposes, we are assuming 'handle_avatar_upload' is a function
        # that takes user_id and avatar_file from the request and updates the database
        user_id = request.form.get('user_id')
        avatar_file = request.files.get('avatar_file')

        if user_id is None or avatar_file is None:
            return jsonify({"message": "Both 'user_id' and 'avatar_file' are required"}), 400

        # Assume 'handle_avatar_upload' is a function that handles the avatar upload
        success = handle_avatar_upload(user_id, avatar_file)

        if success:
            return jsonify({"message": "Avatar uploaded successfully"}), 200
        else:
            return jsonify({"message": "Failed to upload avatar"}), 500

    except Exception as e:
        # Log the error or handle it based on your application needs
        return jsonify({"message": "An error occurred during avatar upload"}), 500

import os

from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'path/to/your/upload/folder'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024 # 5MB

def handle_avatar_upload(user_id, avatar_file):
    try:
        # Validate the file type and size
        if avatar_file and allowed_file(avatar_file.filename) and avatar_file.content_type.startswith('image/') and avatar_file.content_length < MAX_FILE_SIZE:
            # Securely save the file using the user's ID and a secure filename
            filename = secure_filename(f"user_{user_id}_avatar.{imghdr.what(None, avatar_file.read())}")
            avatar_file.seek(0)  # Reset file cursor after reading content type
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            avatar_file.save(filepath)

            # Update the user's profile picture in the database
            user = User.query.get(user_id)
            if user:
                user.profile_picture = filepath
                db.session.commit()

                # Return True to indicate a successful upload
                return True
            else:
                # Return False if the user is not found in the database
                return False
        else:
            # Return False if the file type, size, or content type is not allowed
            return False
    except Exception as e:
        # Log the error or handle it based on your application needs
        print(f"An error occurred during avatar upload: {e}")
        return False