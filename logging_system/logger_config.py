import logging
from logging.handlers import RotatingFileHandler

from flake8_handlers import Flake8Handler

from logging_system.logger_handlers import (configure_file_handler,
                                            configure_flake8_handler)


def setup_logging(log_file='your_project.log', log_format=None, date_format=None):
    if log_format is None:
        log_format = '{asctime} | {levelname:8} | {module}:{lineno} | {message}'
    if date_format is None:
        date_format = '%Y-%m-%d %H:%M:%S'

    logging.basicConfig(level=logging.INFO, format=log_format, datefmt=date_format)

    # Configure file handler
    file_handler = configure_file_handler(log_format, date_format, log_file)
    logging.getLogger('').addHandler(file_handler)

    # Configure Flake8Handler
    flake8_handler = configure_flake8_handler()
    logging.getLogger('').addHandler(flake8_handler)
