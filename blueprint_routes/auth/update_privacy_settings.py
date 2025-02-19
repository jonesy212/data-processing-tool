# utils/database.py (Assuming you have an SQLAlchemy model for users, for example, User)
from flask import jsonify

from database.extensions import db
from models.user.user import User


def update_privacy_settings_db(user_id, privacy_settings):
    try:
        #logic to update privacy settings in the database
        user = User.query.filter_by(id=user_id).first()

        if user:
            # Assuming 'privacy_settings' is a JSON object with 'visibility', 'tracking', etc.
            user.privacy_settings = privacy_settings

            # Commit changes to the database
            db.session.commit()

            return True
        else:
            return False

    except Exception as e:
        # Log the error or handle it based on your application needs
        print(f"An error occurred during database update: {str(e)}")
        return False
