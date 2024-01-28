# todo_management/__init__.py

class TodoManager:
    _instance = None
    central_todo_list = []
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TodoManager, cls).__new__(cls)
        return cls._instance

    def get_todos(self):
        return self.get_central_todo_list()

    @staticmethod
    def get_central_todo_list():
        return TodoManager.central_todo_list

    def add_todo_to_central_list(self, todo):
        TodoManager.central_todo_list.append(todo)

    def remove_todo_from_central_list(self, todo):
        TodoManager.central_todo_list.remove(todo)

    def get_todo_by_id(self, todo_id):
        for todo in TodoManager.central_todo_list:
            if todo.id == todo_id:
                return todo
        return None

    def log_todo(self, todo_item):
        TodoManager.central_todo_list.append(todo_item)




def log_todo(message, category=None, user=None, central_todo_list=None):
    todo_item = {'type': 'todo', 'message': message, 'user': user, 'category': category}
    # Add the todo_item to the central_todo_list
    central_todo_list.append(todo_item)

# Example usage
log_todo('Complete task A', category='team', user='john_doe')
log_todo('Review project timeline', category='project_manager', user='alice')
