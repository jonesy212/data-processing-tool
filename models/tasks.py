# task.py
from datetime import datetime

# from configs.config import db
from database.extensions import db
from script_commands.celery_module import Celery

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

    def perform_data_processing(self):
        #update taskk status 'in-progress' or handle any other relavant logic
        self.status = 'in-progress'
        self.start_time = datetime.utcnow()
        db.session.commit()

    def __repr__(self):
        return f"<DataProcessingTask(id={self.id}, task_id={self.task_id})>"
    