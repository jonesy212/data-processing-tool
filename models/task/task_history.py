# task_history.py
from datetime import datetime

from flask import render_template, request

from configs.config import app
from database.extensions import db


class TaskHistoryModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    action = db.Column(db.String(20), nullable=False)

    def __repr__(self):
        return f"<TaskHistoryModel(id={self.id}, task_id={self.task_id}, action={self.action})>"




# Dummy data for task history (replace with your actual data model)
task_history_data = [
    {'task_id': 1, 'task_name': 'Task 1', 'status': 'Completed'},
    {'task_id': 2, 'task_name': 'Task 2', 'status': 'In Progress'},
    {'task_id': 3, 'task_name': 'Task 3', 'status': 'Pending'},
    # Add more tasks as needed
]

@app.route('/task-history')
def task_history():
    return render_template('task_history.html', task_history_data=task_history_data)
