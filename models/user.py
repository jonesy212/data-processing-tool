# user.py
from flask_login import UserMixin

from database.extensions import db


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    tier = db.Column(db.String(20), nullable=False)  # 'free', 'standard', 'premium', 'enterprise'
    upload_quota = db.Column(db.Integer, default=0)  # Remaining upload quota for the month

    def __repr__(self):
        return '<User %r>' % self.username
    
    def has_quota(self):
        # check if the user has remaining upload quota
        return self.upload > 0
