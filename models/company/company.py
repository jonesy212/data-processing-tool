from sqlalchemy import relationship

from database.extensions import db


class Company(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    industry = db.Column(db.String(50))
    size = db.Column(db.String(20))  # Small, Medium, Large, etc.

    # Bidirectional Relationship: Linking to the RecruiterProfile model
    recruiter_profile = relationship('RecruiterProfile', back_populates='company', uselist=False)

    # Other Company-specific fields
    # ...
    # Relationships
    recruiter_profile = relationship('RecruiterProfile', back_populates='company', uselist=False)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'))
    team = relationship('Team', back_populates='companies')

    

    def __repr__(self):
        return f"<Company(id={self.id}, name={self.name}, industry={self.industry})>"
