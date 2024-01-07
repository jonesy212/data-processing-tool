# blueprint_register.py
from onboarding_routes import onboarding_routes
from tasks.task_routes import task_routes

from authentication.auth import auth_bp
from blueprint_routes.nlp_routes import nlp_bp
from blueprint_routes.register_routes import register
from blueprint_routes.user_history import user_history_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(task_routes, url_prefix='/tasks')  # You can adjust the prefix as needed
    app.register_blueprint(onboarding_routes, url_prefix='/api')
    app.register_blueprint(nlp_bp, url_prefix='/nlp')
    app.register_blueprint(user_history_bp, url_prefix='/register')

    app.register_blueprint(register)
    # Add more blueprint registrations here
