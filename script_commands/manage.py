# manage.py

from flask.cli import FlaskGroup
from flask_migrate import Migrate

from app import create_app
from database.extensions import db

app = create_app()
migrate = Migrate(app, db)
cli = FlaskGroup(create_app=create_app)


def init_database():
    # Your init_database logic here
    with app.app_context():
        db.create_all()


if __name__ == '__main__':
    cli()
