from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from todos.todo import Todo, TodoManager

from configs.config import app

todo_bp = Blueprint('auth_bp', __name__)

@todo_bp.route('/todos', methods=['POST'])
@jwt_required()
def create_todo():
    data = request.json
    title = data.get('title')

    # Your logic to create a new todo and add it to the central todo list
    new_todo = Todo(title, todo_manager_instance)
    todo_manager_instance.add_todo_to_central_list(new_todo)

    # Serialize the created todo data as needed
    serialized_todo = {'id': new_todo.id, 'title': new_todo.title, 'finished': new_todo.finished}

    return jsonify(serialized_todo), 201

@todo_bp.route('/todos/<int:todo_id>', methods=['PUT'])
@jwt_required()
def update_todo(todo_id):
    # Your logic to update a specific todo in the central todo list
    todo = todo_manager_instance.get_todo_by_id(todo_id)

    if not todo:
        return jsonify({"message": "Todo not found"}), 404

    data = request.json
    todo.title = data.get('title', todo.title)
    todo.finished = data.get('finished', todo.finished)

    # Serialize the updated todo data as needed
    serialized_todo = {'id': todo.id, 'title': todo.title, 'finished': todo.finished}

    return jsonify(serialized_todo)

@todo_bp.route('/todos/<int:todo_id>', methods=['DELETE'])
@jwt_required()
def delete_todo(todo_id):
    # Your logic to delete a specific todo from the central todo list
    todos = todo_manager_instance.get_todos()


    if not todos:
        return jsonify({"message": "Todo not found"}), 404

    todo_manager_instance.remove_todo_from_central_list(todos)

    return jsonify({"message": "Todo deleted successfully"})



@todo_bp.route('/todos', methods=['POST'])
@jwt_required()
def create_todo():
    data = request.json
    title = data.get('title')

    # Your logic to create a new todo and add it to the central todo list
    new_todo = Todo(title, todo_manager_instance)
    todo_manager_instance.add_todo_to_central_list(new_todo)

    # Serialize the created todo data as needed
    serialized_todo = {'id': new_todo.id, 'title': new_todo.title, 'finished': new_todo.finished}

    return jsonify(serialized_todo), 201


@todo_bp.route('/toggle/<string:entity_type>/<int:entity_id>', methods=['POST'])
@jwt_required()
def toggle_entity(entity_type, entity_id):
    # Your logic to toggle the specified entity (user, calendar event, task, etc.)
    # Determine the entity type and toggle its status accordingly

    # Example: Toggle logic for a todo
    if entity_type == 'todo':
        todo = todo_manager_instance.get_todo_by_id(entity_id)
        if todo:
            todo.toggle_status()  # Implement the toggle logic in your Todo class
            return jsonify({"message": f"{entity_type} toggled successfully"})

    # Add similar logic for other entity types (user, calendar event, etc.)

    return jsonify({"message": f"Invalid entity type: {entity_type}"}), 400


@todo_bp.route('/todos/<int:todo_id>/toggle', methods=['PUT'])
@jwt_required()
def toggle_todo(todo_id):
    # Your logic to toggle a specific todo's status in the central todo list
    todo = todo_manager_instance.get_todo_by_id(todo_id)

    if not todo:
        return jsonify({"message": "Todo not found"}), 404

    # Toggle the todo's status
    todo.toggle()

    # Serialize the toggled todo data as needed
    serialized_todo = {'id': todo.id, 'title': todo.title, 'finished': todo.finished}

    return jsonify(serialized_todo)


@todo_bp.route('/todos', methods=['GET'])
@jwt_required()
def fetch_all_todos():
    # Your logic to fetch all todos from the central todo list
    todos = todo_manager_instance.get_todos()

    # Serialize the list of todos as needed
    serialized_todos = [{'id': todo.id, 'title': todo.title, 'finished': todo.finished} for todo in todos]

    return jsonify(serialized_todos)


@todo_bp.route('/todos/complete-all', methods=['PUT'])
@jwt_required()
def complete_all_todos():
    # Your logic to mark all todos as completed in the central todo list
    todos = todo_manager_instance.get_todos()

    for todo in todos:
        todo.mark_completed()

    # Serialize the list of completed todos as needed
    serialized_completed_todos = [{'id': todo.id, 'title': todo.title, 'finished': todo.finished} for todo in todos]

    return jsonify(serialized_completed_todos)

if __name__ == "__main__":
    todo_manager_instance = TodoManager()
    todo_bp.todo_manager_instance = todo_manager_instance
    app.run(debug=True)
# You can include additional routes or functionality as needed
