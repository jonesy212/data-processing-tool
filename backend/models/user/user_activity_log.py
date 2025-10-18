# models/user_activity_log.py
from datetime import datetime

from sqlalchemy.exc import SQLAlchemyError

from database.extensions import db


class UserActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    # relationship
    user = db.relationship('User', backref=db.backref('feedbacks', lazy=True))

    def __repr__(self):
        return f'<UserActivityLog(id={self.id}, user_id={self.user_id}, action={self.action}, timestamp={self.timestamp})>'

    @classmethod
    def log_activity(cls, user_id, action):
        try:
            # Validate user_id and action (adjust as needed)
            if not user_id or not action:
                raise ValueError("User ID and action are required for logging activity")

            # Create and save the user activity log to the database
            user_activity_log = cls(user_id=user_id, action=action)
            db.session.add(user_activity_log)
            db.session.commit()

            return user_activity_log

        except SQLAlchemyError as e:
            db.session.rollback()
            # Log the error or handle it based on your application needs
            raise e
