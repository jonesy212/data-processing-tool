# department.py
from database.extensions import db


class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)

    # Relationship with UserRole
    user_roles = db.relationship('UserRole', back_populates='department')

    def __repr__(self):
        return f"<Department(id={self.id}, name={self.name})>"

# user_role.py
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database.extensions import db


class UserRole(db.Model):
    """UserRole class represents the dynamic relationships between User and other entities."""
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    user = db.relationship('User', back_populates='user_roles')
    
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=False)
    
    # Relationship with Department
    department_id = db.Column(db.Integer, db.ForeignKey('department.id'))
    department = db.relationship('Department', back_populates='user_roles')

    def __repr__(self):
        return f'<UserRole user_id={self.user_id}, entity_type={self.entity_type}, entity_id={self.entity_id}, department_id={self.department_id}>'

# user.py
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from database.extensions import db


class User(db.Model):
    """User class represents a user in the system."""
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    
    user_roles = db.relationship('UserRole', back_populates='user')

    def __repr__(self):
        return f'<User {self.username}>'
    
def has_role(self, role):
    return any(role == r for r in self.roles)

def has_permission(self, permission_name):
    # Logic to check if the role grants the specified permission
    # Example: Check if the role has the permission in its associated permissions
    return any(permission.name == permission_name for permission in self.department.permissions)