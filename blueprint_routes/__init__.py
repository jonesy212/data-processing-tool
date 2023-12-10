# blueprints/__init__.py
from flask import Blueprint

# Create blueprints here
auth_bp = Blueprint('auth_bp', __name__)
task_bp = Blueprint('task_bp', __name__)

