from datetime import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class TaskExecutionLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('data_processing_task.id'))
    status = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    logs = db.Column(db.Text)
