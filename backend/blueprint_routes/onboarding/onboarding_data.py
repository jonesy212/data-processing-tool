# onboarding_data.py

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database.extensions import db


class OnboardingData(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    questionnaire_responses = db.Column(db.JSON)  # You might adjust this depending on your questionnaire structure
    profile_setup_data = db.Column(db.JSON)  # Adjust based on your profile setup data structure
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship('User', backref='onboarding_data', lazy=True)

    def __repr__(self):
        return f"<OnboardingData(id={self.id}, user_id={self.user_id}, created_at={self.created_at})>"
