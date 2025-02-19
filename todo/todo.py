from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from todo_management import TodoManager

todo_bp = Blueprint('todo', __name__)
from configs.config import app


class Todo:
    def __init__(self, title, todo_manager):
        self.id = len(todo_manager.get_central_todo_list()) + 1  # Generate a unique ID
        self.title = title
        self.finished = False
        self.todo_manager = todo_manager

    def toggle(self):
        self.finished = not self.finished
        user_id = get_jwt_identity()
        # Log the todo toggle
        self.todo_manager.log_todo(f'Toggle todo "{self.title}"', user=user_id, category='individual')

@todo_bp.route('/todos', methods=['GET'])
@jwt_required()
def get_todos():
    # Use the helper method from TodoManager to get todos
    todos = todo_manager_instance.get_todos()

    # Serialize the todo data as needed
    serialized_todos = [{'id': todo.id, 'title': todo.title, 'finished': todo.finished} for todo in todos]

    return jsonify(serialized_todos)


@todo_bp.route('/todos/<int:todo_id>', methods=['GET'])
@jwt_required()
def get_todo(todo_id):
    # Your logic to get a specific todo from the central todo list
    todo = todo_manager_instance.get_todo_by_id(todo_id)

    if not todo:
        return jsonify({"message": "Todo not found"}), 404

    # Serialize the todo data as needed
    serialized_todo = {'id': todo.id, 'title': todo.title, 'finished': todo.finished}

    return jsonify(serialized_todo)

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

if __name__ == "__main__":
    todo_manager_instance = TodoManager()
    todo_bp.todo_manager_instance = todo_manager_instance
    app.run(debug=True)
# You can include additional routes or functionality as needed
# fibonnaci mmethod
