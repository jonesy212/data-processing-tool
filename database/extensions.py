# extensions.py
from databases import Database
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_database(config):
    # Assuming your configuration contains a key 'DATABASE_URL'
    database_url = config.get('DATABASE_URL', 'sqlite:///data.db')
    return Database(database_url)
