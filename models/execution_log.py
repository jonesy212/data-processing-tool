# execution_log.property

# from datetime import datetime

from datetime import datetime

from database.extensions import db


class TaskExecutionLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('data_processing_task.id'))
    status = db.Column(db.String(20), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    logs = db.Column(db.Text)
    
    # relationship between TaskExecutionLog and DataProcessingTask
    task = db.relationship('DatProcessingTask', backref='execution_logs')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # Example: User who triggered the task
    team_id = db.Column(db.Integer, db.ForeignKey('team.id'))  # Example: Team associated with the task

    def __repr__(self):
        return f"<ExecutionLogModel(id={self.id}, task_id={self.task_id}, status={self.status})>"