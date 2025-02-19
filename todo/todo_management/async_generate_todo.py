import asyncio

from todo_management import TodoManager, log_todo

from configs.config import Config as todo_manager


async def generate_async_todos():
    # Create an instance of TodoManager

    # Asynchronously generate todos
    await log_todo_async(todo_manager, 'Complete task A', category='team', user='john_doe')
    await log_todo_async(todo_manager, 'Review project timeline', category='project_manager', user='alice')

async def log_todo_async(todo_manager, message, category=None, user=None):
    # Asynchronously log a todo
    todo_item = {'type': 'todo', 'message': message, 'user': user, 'category': category}
    
    # Use the todo_manager to log the todo
    todo_manager.log_todo(todo_item)

# Run the asynchronous todo generation
asyncio.run(generate_async_todos())
