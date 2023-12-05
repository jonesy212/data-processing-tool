from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class DataProcessingTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    input_dataset_id = db.Column(db.Integer, db.ForeignKey('dataset_model.id'))
    output_dataset_id = db.Column(db.Integer, db.ForeignKey('dataset_model.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    start_time = db.Column(db.DateTime)
    completion_time = db.Column(db.DateTime)


