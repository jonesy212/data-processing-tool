from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database.extensions import db
from models.user import User


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    type = Column(String(50))  # Add a field to specify the type of notification (e.g., 'system', 'chat', etc.)

    # Additional fields based on your requirements
    data = Column(String(255))  # Add a field for additional data if needed

    # Define a relationship with the User model
    user = relationship(User, back_populates='notifications')

    def __repr__(self):
        return f'<Notification {self.id}>'
