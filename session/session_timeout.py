from datetime import timedelta

from configs.config import app

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)
