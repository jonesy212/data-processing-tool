# blueprint_register.py
from onboarding_routes import onboarding_routes
from tasks.task_routes import task_bp

from authentication.auth import auth_bp
from blueprint_routes import nlp_bp, todo_bp, user_bp, user_history_bp
from blueprint_routes.company.company_routes import company_bp, company_routes
from blueprint_routes.data_routes import data_bp
from blueprint_routes.logging.logging_routes import logging_bp
from blueprint_routes.login_routes import login_bp
from blueprint_routes.notifications.notification_routes import notification_bp
from blueprint_routes.register_routes import register
from blueprint_routes.tasks.task_routes import task_bp
from blueprint_routes.teams.team_routes import team_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(task_bp, url_prefix='/task')  # You can adjust the prefix as needed
    app.register_blueprint(onboarding_routes, url_prefix='/api')
    app.register_blueprint(nlp_bp, url_prefix='/nlp')
    app.register_blueprint(user_history_bp, url_prefix='/register')
    app.register_blueprint(data_bp, url_prefix='/data')
    app.register_blueprint(todo_bp, url_prefix='/todo')
    app.regisert_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(team_bp, url_prefix='/team')
    app.register_blueprint(notification_bp, url_prefix='/notifications')
    app.register_blueprint(logging_bp, url_prefix='/logging')
    app.register_blueprint(company_bp, url_prefix='/company')
    app.register_blueprint(login_bp, url_prefix='/login')
    app.register_blueprint(document_bp, url_prefix='/document')
    app.register_blueprint(register)
    # Add more blueprint registrations here
