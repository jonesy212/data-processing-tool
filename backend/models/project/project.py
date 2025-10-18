from datetime import datetime

from sqlalchemy.orm import relationship

from database.extensions import db


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime, nullable=True)
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'), nullable=False)

    # Relationships
    cards = relationship('Card', backref='project', lazy=True)

    def __repr__(self):
        return f"<Project(id={self.id}, name={self.name}, team_id={self.team_id})>"