# models/user/user_history.py
from datetime import datetime

from database.extensions import db


class UserHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    #relationships
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    def __repr__(self):
        return f'<UserHistory(user_id={self.user_id}, action={self.action}, timestamp={self.timestamp})>'
