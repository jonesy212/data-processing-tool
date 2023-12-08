# config.py
import os
import secrets
from datetime import timedelta

from flask import Flask
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from authentication.auth import auth_bp
from database.extensions import db

# Define the base directory of the Flask application
basedir = os.path.abspath(os.path.dirname(__file__))


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'

# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database/data.db')
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'csv', 'xlsx', 'json'}

app.config['JWT_SECRET_KEY'] = secrets.token_hex(16)
app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['JWT_ALGORITHM'] = 'HS256'
app.config['JWT_EXPIRATION_DELTA'] = timedelta(days=1)

jwt = JWTManager(app)
app.register_blueprint(auth_bp, url_prefix='/auth')
db.init_app(app)
migrate = Migrate(app, db, compare_type=True, render_as_batch=True)

# Configuration callback
@migrate.configure
def configure_alembic(config):
    # Modify config object or replace it with a different one
    config.set_main_option('custom_option', 'custom_value')
    return config

