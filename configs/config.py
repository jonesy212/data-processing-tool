# config.py
import os
import secrets
from datetime import timedelta

from flask import Flask
from flask_caching import Cache
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate

from blueprint_routes import auth_bp, task_bp
from database.extensions import create_database, db

# Define the base directory of the Flask application
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_secret_key')
    DATABASE_TYPE = os.environ.get('DATABASE_TYPE', 'sqlite')
    #mobx configurations
    SRC_PATH = 'src'
    OUTPUT_DIR = 'output'
    METADATA_FILENAME_JS = 'metadata.js'
    METADATA_FILENAME_TSX = 'metadata.tsx'
    STORES_DIR = 'src/stores'

def configure_app(app):
    # set the environment variab 'APP_CONFIG_FILE' with the path to your config file
    app.config.from_envvar('APP_CONFIG_FILE')  # Set the environment variable 'APP_CONFIG_FILE' with the path to your config file

# Choose the appropriate database URL based on the selected database
    if app.config['DATABASE_TYPE'] == 'sqlite':
        app.config['DATABASE_URL'] = 'sqlite:///data.db'
    elif app.config['DATABASE_TYPE'] == 'postgresql':
        app.config['DATABASE_URL'] = 'postgresql://your_postgres_uri'
        
    # Add more conditions for other database types as needed
    app.config['DATABASE_URL'] = create_database(app.config).url

    app.config['SECRET_KEY'] = secrets.token_hex(16)
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['ALLOWED_EXTENSIONS'] = {'csv', 'xlsx', 'json'}

    app.config['JWT_SECRET_KEY'] = secrets.token_hex(16)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_ALGORITHM'] = 'HS256'
    app.config['JWT_EXPIRATION_DELTA'] = timedelta(days=1)

    # CACHING CONFIG
    app.config['CACHE_TYPE'] = 'redis'
    app.config['CACHE_REDIS_HOST'] = 'redis://localhost:6379/0'
    cache = Cache(app)

    jwt = JWTManager(app)

    # Register the blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(task_bp, url_prefix='/tasks')

    db.init_app(app)
    migrate = Migrate(app, db, compare_type=True, render_as_batch=True)

    # Configuration callback
    @migrate.configure
    def configure_alembic(config):
        # Modify config object or replace it with a different one
        config.set_main_option('custom_option', 'custom_value')
        return config
    # Add an environment indicator to the config
    app.config['ENVIRONMENT'] = os.environ.get('FLASK_ENV', 'development')
