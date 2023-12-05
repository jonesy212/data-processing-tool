# user.py
from flask_login import UserMixin
from flask_sqlalchemy import SQLAlchemy

from database.init_db import db as user_db


class User(user_db.Model, UserMixin):
    id = user_db.Column(user_db.Integer, primary_key=True)
    username = user_db.Column(user_db.String(80), unique=True, nullable=False)
    email = user_db.Column(user_db.String(120), unique=True, nullable=False)
    password = user_db.Column(user_db.String(200), nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username