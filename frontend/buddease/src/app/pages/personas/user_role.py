# user_role.py
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database.extensions import db


class UserRole(db.Model):
    """UserRole class represents the dynamic relationships between User and other entities."""
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('user.id'))
    user = relationship('User', back_populates='user_roles')
    
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)

    def __repr__(self):
        return f'<UserRole user_id={self.user_id}, entity_type={self.entity_type}, entity_id={self.entity_id}>'

# user.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from database.extensions import db
