# manage.py

from flask import Flask
from flask.cli import FlaskGroup
from flask_migrate import Migrate

from app import create_app
from database.extensions import db
from script_command.celery_module import make_celery

app = create_app()
migrate = Migrate(app, db)
celery = make_celery(app)
cli = FlaskGroup(create_app=create_app)

def init_database():
    # Your init_database logic here
    with app.app_context():
        db.create_all()

def init_app(app: Flask):
    from . import commands
    app.cli.add_command(commands.run_celery_worker)
    

def init_cli(app: Flask):
    # Define the init_cli function
    return FlaskGroup(create_app=lambda: app)

if __name__ == '__main__':
    # call this function to initialize the app
    init_app(app) 
    cli()
