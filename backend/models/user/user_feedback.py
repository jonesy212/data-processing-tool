# models/user_feedback.py
from datetime import datetime

from sqlalchemy.exc import SQLAlchemyError

from database.extensions import db


class UserFeedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    feedback_text = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('user_feedback', lazy=True))

    def __repr__(self):
        return f'<UserFeedback(id={self.id}, timestamp={self.timestamp})>'

    @classmethod
    def create_feedback(cls, feedback_text):
        try:
            # Validate the feedback_text (adjust as needed)
            if not feedback_text or len(feedback_text.strip()) == 0:
                raise ValueError("Feedback text cannot be empty")

            # Create and save the user feedback to the database
            user_feedback = cls(feedback_text=feedback_text)
            db.session.add(user_feedback)
            db.session.commit()

            return user_feedback

        except SQLAlchemyError as e:
            db.session.rollback()
            # Log the error or handle it based on your application needs
            raise e
