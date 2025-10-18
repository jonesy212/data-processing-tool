# tasks.py
from datetime import datetime

from sqlalchemy.orm import relationship

# from configs.config import db
from database.extensions import db
from logging_system.error_logger import log_error
from logging_system.warning_events import log_error, log_info
from script_command.celery_module import Celery

celery = Celery(__name__, broker='pyamqp://guest:guest@localhost//', backend='rpc://')

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
    due_date = db.Column(db.DateTime)
    priority = db.Column(db.String(20))  # You can adjust the type based on your needs
    tags = db.Column(db.String(255))  # Comma-separated list or JSON array for tags
    assigned_user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    assigned_user = relationship('User', foreign_keys=[assigned_user_id])

    def initiate_processing(self):
        #update taskk status 'in-progress' or handle any other relavant logic
        self.status = 'in-progress'
        self.start_time = datetime.utcnow()
        db.session.commit()

    def initiate_processing(self):
        try:
            # Update task status to 'in-progress' or handle any other relevant logic
            self.status = 'in-progress'
            self.start_time = datetime.utcnow()
            db.session.commit()

            # Log information about task initiation
            log_info(f"Data processing initiated for task ID {self.id}")
        except Exception as e:
            # Log an error if there's an issue during initiation
            log_error(f"Error initiating data processing for task ID {self.id}: {str(e)}")

    def __repr__(self):
        return f"<DataProcessingTask(id={self.id}, task_id={self.task_id})>"