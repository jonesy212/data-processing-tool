from sqlalchemy import relationship

from database.extensions import db


class RecruiterProfile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Company Information
    company_name = db.Column(db.String(100), nullable=False)
    industry = db.Column(db.String(50))
    company_size = db.Column(db.String(20))  # Small, Medium, Large, etc.

    # Job Listings and Recruitment
    posted_jobs = relationship('JobListing', backref='recruiter', lazy=True)

    # Bidirectional Relationship: Linking to the Company model
    company = relationship('Company', back_populates='recruiter_profile', uselist=False)

    # Contact Information
    contact_email = db.Column(db.String(120))
    contact_phone = db.Column(db.String(20))

    # Additional Details
    about_company = db.Column(db.Text)
    social_media_links = db.Column(db.String(255))  # Comma-separated list or JSON array

    def __repr__(self):
        return f"<RecruiterProfile(id={self.id}, user_id={self.user_id}, company_name={self.company_name})>"
