# commands.py
from subprocess import run

from flask.cli import FlaskGroup, with_appcontext

from app import create_app
from database.extensions import db

app = create_app()
cli = FlaskGroup(create_app=create_app)


@with_appcontext
def run_celery_worker():
    run(["celery", "-A", "scripts_commands.celery_modules", "worker", "--loglevel=info"])
    

@cli.command("init_database")
def init_database():
    # you init_database logic here
    with app.app_context():
        db.create_all()
        
if __name__ == '__main__':
    cli.run()
