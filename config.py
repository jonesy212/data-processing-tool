# config.py
import secrets

from flask import Flask
from flask_migrate import Migrate

from database.extensions import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
app.config['SECRET_KEY'] = secrets.token_hex(16)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'csv', 'xlsx', 'json'}

db.init_app(app)
migrate = Migrate(app, db, compare_type=True, render_as_batch=True)

# Configuration callback
@migrate.configure
def configure_alembic(config):
    # Modify config object or replace it with a different one
    config.set_main_option('custom_option', 'custom_value')
    return config
