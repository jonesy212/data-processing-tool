from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class DatasetProcessingLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    action_type = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    dataset_id = db.Column(db.Integer, db.ForeignKey('dataset_model.id'))
    details = db.Column(db.Text)
