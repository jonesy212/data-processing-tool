# regulatory_requirement.py
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database.init_db import db  # Assuming db is your SQLAlchemy instance


class RegulatoryRequirement(db.Model):
    __tablename__ = 'regulatory_requirements'

    id = Column(Integer, primary_key=True)
    country_or_region = Column(String(100), nullable=False)
    gdpr_compliant = Column(String(10), nullable=False, default='No')
    ccpa_compliant = Column(String(10), nullable=False, default='No')
    hipaa_compliant = Column(String(10), nullable=False, default='No')
    # Add more fields for other regulatory requirements as needed

    def __repr__(self):
        return f'<RegulatoryRequirement id={self.id}, Country/Region={self.country_or_region}>'
    companies = relationship('Company', backref='regulatory_requirement')