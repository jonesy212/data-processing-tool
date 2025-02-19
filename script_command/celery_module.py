# celery_module.py
from celery import Celery

from configs.config import app

celery = Celery(__name__)

def make_celery(app):
    celery.conf.update(app.config)
    return celery
