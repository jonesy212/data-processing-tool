# blueprint_register.py
from onboarding_routes import onboarding_routes
from tasks.task_routes import task_routes

from authentication.auth import auth_bp
from blueprint_routes.register_routes import register


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(task_routes, url_prefix='/tasks')  # You can adjust the prefix as needed
    app.register_blueprint(onboarding_routes, url_prefix='/api')
    app.register_blueprint(register)
    # Add more blueprint registrations here
