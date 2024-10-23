# role.py
import logging

from sqlalchemy import (Column, ForeignKey, Index, Integer, String,
                        UniqueConstraint)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import relationship

from database.extensions import db


class Role(db.Model):
    """Role class represents user roles in the system."""

    # Primary key
    id = Column(Integer, primary_key=True)

    # Foreign key relationship with users having this role
    user_id = Column(Integer, ForeignKey('user.id'))
    users = relationship('User', backref='role', lazy=True)

    # Role name (e.g., 'Admin', 'User', 'Developer', etc.)
    name = Column(String(50), unique=True, nullable=False)

    # Index for the name column
    Index('idx_role_name', name)

    # Unique constraint on the name column
    __table_args__ = (UniqueConstraint('name'),)

    def __repr__(self):
        """String representation of the Role object."""
        return f'<Role {self.name}>'

    @classmethod
    def create_role(cls, name):
        """Create a new role."""
        try:
            role = cls(name=name)
            db.session.add(role)
            db.session.commit()
            logging.info(f"Role '{name}' created successfully.")
            return role
        except IntegrityError:
            db.session.rollback()
            logging.error(f"Failed to create role '{name}'.")
            return None
