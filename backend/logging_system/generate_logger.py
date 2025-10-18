import json
import logging
import os
import time

from watchdog.events import FileSystemEventHandler

from logging_system.logger_config import setup_logging
from logging_system.logger_handlers import configure_file_handler, configure_flake8_handler
from logging_system.logger_rules import LoggerRules


class LoggerGenerator(FileSystemEventHandler):
    def __init__(self, project_path, logger_config_template, log_format=None, date_format=None, log_types=None):
        super().__init__()
        self.project_path = project_path
        self.logger_config_template = logger_config_template
        self.log_format = log_format
        self.date_format = date_format
        self.log_types = log_types
        self.loggers = {}

    def log_change(self, log_type, change_description):
        if log_type in self.log_generators:
            self.log_generators[log_type].log_change(change_description)
        else:
            print(f"Error: Unsupported log type '{log_type}'")

    def generate_logger_config(self, module_path):
        logger_name = os.path.splitext(os.path.basename(module_path))[0]
        log_level = LoggerRules.get_log_level()

        config_data = {
            'logger_name': logger_name,
            'log_level': 'DEBUG',
            'date_format': '%Y-%m-%d %H:%M:%S',  # Example date format, customize as needed
            'handlers': ['console', 'file'],  # Example handlers, customize as needed
            'filters': [],  # Example filters, customize as needed
            'propagate': True,  # Example propagate setting, customize as needed
            'hooks': [],  # Example hooks, customize as needed
            'error_handlers': [],  # Example error handlers, customize as needed
            # Add more configuration parameters as needed
        }

        try:
            json_template = json.loads(self.logger_config_template.format(**config_data))
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON format in logger_config_template")
            return None

        return self.configure_logger(json_template)

    def configure_logger(self, config_data):
        logger = logging.getLogger(config_data['logger_name'])
        logger.setLevel(logging.getLevelName(config_data['log_level']))

        file_handler = configure_file_handler(self.log_format, self.date_format)
        logger.addHandler(file_handler)

        flake8_handler = configure_flake8_handler()
        logger.addHandler(flake8_handler)

        self.loggers[config_data['logger_name']] = logger

        return logger

    def on_any_event(self, event):
        if event.is_directory or not event.src_path.endswith('.py'):
            return

        module_path = os.path.relpath(event.src_path, self.project_path)
        logger = self.generate_logger_config(module_path)

        logger_output_path = os.path.join('path/to/output/loggers', f'{os.path.splitext(module_path)[0]}_logger.json')

        with open(logger_output_path, 'w') as logger_config_file:
            logger_config_file.write(setup_logging)

        print(f"Logger configuration generated for {module_path} at {logger_output_path}")

