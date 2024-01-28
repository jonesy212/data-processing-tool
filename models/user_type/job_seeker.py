# job_seeker.py
from sqlalchemy import relationship

from database.extensions import db


class JobSeekerProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Personal Information
    full_name = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(10))

    # Education Details
    education = relationship('Education', backref='job_seeker', lazy=True)

    # Work Experience
    work_experience = relationship('WorkExperience', backref='job_seeker', lazy=True)

    # Skills and Interests
    skills = db.Column(db.String(255))  # Comma-separated list or JSON array
    interests = db.Column(db.Text)

    # Contact Information
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(20))

    # Portfolio and Additional Details
    portfolio_url = db.Column(db.String(255))
    about_me = db.Column(db.Text)

    # Relationships
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = relationship('User', backref='job_seeker_profile', lazy=True)

    def __repr__(self):
        return f"<JobSeekerProfile(id={self.id}, user_id={self.user_id}, full_name={self.full_name})>"
