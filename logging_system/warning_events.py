import logging

from todos.todo_management import TodoManager

# Centralized tracking system for todos
central_todo_list = []

# System to-do list to store log messages
system_todo_list = []

def log_info(message, user=None):
    extra_info = {'user': user} if user else {}
    logging.info(message, extra=extra_info)

def log_warning(message, user=None):
    extra_info = {'user': user} if user else {}
    logging.warning(message, extra=extra_info)

def log_error(message, user=None):
    extra_info = {'user': user} if user else {}
    logging.error(message, extra=extra_info)

    # Add the error message to the system to-do list
    todo_item = {'type': 'error', 'message': message, 'user': user}
    if todo_item:
        central_todo_list = TodoManager.get_central_todo_list()
        central_todo_list.append(todo_item)

def log_exception(message, user=None):
    extra_info = {'user': user} if user else {}
    logging.exception(message, extra=extra_info)

    # Add the exception message to the system to-do list
    todo_item = {'type': 'exception', 'message': message, 'user': user}
    if todo_item:
        central_todo_list = TodoManager.get_central_todo_list()
        central_todo_list.append(todo_item)
