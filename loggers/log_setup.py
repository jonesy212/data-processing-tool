# In a file, e.g., log_config.py
import logging
import logging.config
from logging.handlers import RotatingFileHandler

from flake8_handlers import Flake8Handler


def setup_logging():
    log_format = '{asctime} | {levelname:8} | {module}:{lineno} | {message}'
    date_format = '%Y-%m-%d %H:%M:%S'

    logging.basicConfig(level=logging.INFO, format=log_format, datefmt=date_format)

    # Create a file handler that rotates logs
    file_handler = RotatingFileHandler('data_processing_tool.log', maxBytes=10 * 1024 * 1024, backupCount=5)
    file_handler.setFormatter(logging.Formatter(log_format, datefmt=date_format))
    file_handler.setLevel(logging.DEBUG)

     # Add the file handler to the root logger
    logging.getLogger('').addHandler(file_handler)

    # Add the Flake8Handler to capture flake8 output
    logging.getLogger('').addHandler(Flake8Handler())