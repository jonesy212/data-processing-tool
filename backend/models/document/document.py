from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database.extensions import db


class Document(db.Model):
    id = Column(Integer, primary_key=True)
    title = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # Define the type of document (e.g., report, memo, etc.)
    content = Column(Text, nullable=False)
    description = Column(Text)
    tags = Column(String(255))  # Comma-separated list or JSON array for tags
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    created_by = Column(String(80), nullable=False)  # Assuming this is the username of the creator
    updated_by = Column(String(80))  # Username of the user who last updated the document
    
    # Define relationships
    team_id = Column(Integer, ForeignKey('team.id'), nullable=False)
    team = relationship('Team', backref='documents')  # Assuming one-to-many relationship with Team
    
    
    # Relationship with User (members who can manage documents)
    member_id = Column(Integer, ForeignKey('user.id'))
    member = relationship('User', backref='managed_documents')  # Assuming one-to-many relationship with User
    
    # Add more relationships as needed
    
    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title}, type={self.type}, created_by={self.created_by})>"
