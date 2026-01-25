# init_db.py
from database.extensions import db


def init_db(app):
    db.init_app(app)
