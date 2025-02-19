# blueprint_routes/task_bp.py
from flask import Blueprint, jsonify, request

from database.extensions import db
from models.task.data_processing_task import DataProcessingTask
from models.team.team import Team

task_bp = Blueprint('task_bp', __name__)

# Route to get all tasks
@task_bp.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = DataProcessingTask.query.all()
    task_list = [
        {
            'id': task.id,
            'name': task.name,
            'description': task.description,
            'status': task.status,
            # Add other fields as needed
        }
        for task in tasks
    ]
    return jsonify({'tasks': task_list})


# Route to get a specific task by ID
@task_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = DataProcessingTask.query.get_or_404(task_id)
    task_data = {
        'id': task.id,
        'name': task.name,
        'description': task.description,
        'status': task.status,
        # Add other fields as needed
    }
    return jsonify({'task': task_data})


# Route to create a new task
@task_bp.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    new_task = DataProcessingTask(
        name=data.get('name'),
        description=data.get('description'),
        status=data.get('status', 'pending'),
        # Add other fields as needed
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify({'message': 'Task created successfully'}), 201


# Route to update an existing task
@task_bp.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = DataProcessingTask.query.get_or_404(task_id)
    data = request.get_json()
    task.name = data.get('name', task.name)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    # Update other fields as needed
    db.session.commit()
    return jsonify({'message': 'Task updated successfully'})


# Route to delete a task
@task_bp.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = DataProcessingTask.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'message': 'Task deleted successfully'})


@task_bp.route('/tasks/<int:task_id>/assign/<int:team_id>', methods=['POST'])
def assign_task_to_team(task_id, team_id):
    task = DataProcessingTask.query.get_or_404(task_id)
    # Assuming you have a relationship between tasks and teams
    team = Team.query.get_or_404(team_id)
    
    task.team = team
    db.session.commit()
    
    return jsonify({'message': f'Task assigned to Team {team_id} successfully'})


# Route to unassign a task from a team
@task_bp.route('/tasks/<int:task_id>/unassign', methods=['POST'])
def unassign_task(task_id):
    task = DataProcessingTask.query.get_or_404(task_id)
    
    task.team = None
    db.session.commit()
    
    return jsonify({'message': 'Task unassigned successfully'})