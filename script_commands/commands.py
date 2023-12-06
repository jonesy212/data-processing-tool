# commands.py
from flask.cli import FlaskGroup

from app import create_app
from database.extensions import db

app = create_app()
cli = FlaskGroup(create_app=create_app)


@cli.command("init_database")
def init_database():
    # you init_database logic here
    with app.app_context():
        db.create_all()
        
if __name__ == '__main__':
    cli.run()
