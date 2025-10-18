import logging

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from todo.todo_management import TodoManager

logging_bp = Blueprint('logging', __name__)

# Centralized tracking system for todos
central_todo_list = []

@logging_bp.route('/info', methods=['POST'])
@jwt_required()
def log_info():
    data = request.get_json()
    message = data.get('message')
    user = data.get('user')

    extra_info = {'user': user} if user else {}
    logging.info(message, extra=extra_info)

    return jsonify({'status': 'success'}), 200

@logging_bp.route('/warning', methods=['POST'])
def log_warning():
    data = request.get_json()
    message = data.get('message')
    user = data.get('user')

    extra_info = {'user': user} if user else {}
    logging.warning(message, extra=extra_info)

    return jsonify({'status': 'success'}), 200

@logging_bp.route('/error', methods=['POST'])
def log_error():
    data = request.get_json()
    message = data.get('message')
    user = data.get('user')

    extra_info = {'user': user} if user else {}
    logging.error(message, extra=extra_info)

    # Add the error message to the system to-do list
    todo_item = {'type': 'error', 'message': message, 'user': user}
    if todo_item:
        global central_todo_list
        central_todo_list = TodoManager.get_central_todo_list()
        central_todo_list.append(todo_item)

    return jsonify({'status': 'success'}), 200
