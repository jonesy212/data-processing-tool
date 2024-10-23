from datetime import datetime

from sqlalchemy.orm import relationship

from database.init_db import db

class DatasetModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    file_path_or_url = db.Column(db.String(255), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    tags_or_categories = db.Column(db.String(255)) # Comma-separated list or JSON array
    format = db.Column(db.String(20), nullable=False)
    visibility = db.Column(db.String(20), default='private') # public, private, shared
    # Add other fields as needed

    # Relationships
    uploaded_by_team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=True)
    uploaded_by_team = relationship('Team', foreign_keys=[uploaded_by_team_id])
    uploaded_by_user = relationship('User', foreign_keys=[uploaded_by])

    def __repr__(self):
        return f'<DatasetModel id={self.id}, {self.name}>'