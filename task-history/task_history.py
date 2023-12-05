# task_history.py
from flask import Flask, render_template, request

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run()
