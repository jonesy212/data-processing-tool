# RandomTable.py
from datetime import datetime
from sqlalchemy.orm import relationship

from database.init_db import db

from datetime import datetime, timezone

class RandomTable(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    data_source = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # Relationships
    datasets = relationship('DatasetModel', backref='random_table', lazy=True)
    users = relationship('User', secondary='user_random_table', backref='random_tables')

    def __repr__(self):
        return f'<RandomTable id={self.id}, {self.name}>'
