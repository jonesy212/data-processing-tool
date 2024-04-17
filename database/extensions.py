# extensions.py
from databases import Database
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import scoped_session, sessionmaker

db = SQLAlchemy()

async_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, class_=scoped_session, expire_on_commit=False, future=True))

def create_database(config):
    # Assuming your configuration contains a key 'DATABASE_URL'
    database_url = config.get('DATABASE_URL', 'sqlite:///data.db')
    return Database(database_url)   

