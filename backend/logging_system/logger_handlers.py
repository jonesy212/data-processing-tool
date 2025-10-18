import logging
from logging.handlers import RotatingFileHandler

from flake8_handlers import Flake8Handler


def configure_file_handler(log_format, date_format, log_file='your_project.log'):
    file_handler = RotatingFileHandler(log_file, maxBytes=10 * 1024 * 1024, backupCount=5)
    file_handler.setFormatter(logging.Formatter(log_format, datefmt=date_format))
    file_handler.setLevel(logging.DEBUG)
    return file_handler

def configure_flake8_handler():
    return Flake8Handler()
