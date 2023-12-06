from datetime import timedelta

from config import app

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
