import json
import logging
import os
import time

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from logging_system.activity_monitor.conditions import \
    overall_low_activity_condition
from logging_system.logger_config import setup_logging
from logging_system.logger_handlers import (configure_file_handler,
                                            configure_flake8_handler)
from logging_system.logger_rules import LoggerRules
from logging_system.web3_wallet.web3_libraries_changes_logger import \
    Web3LibrariesChangesLogger


class LoggerGenerator(FileSystemEventHandler):
    @staticmethod
    def get_web3_libraries_logger():
        return Web3LibrariesChangesLogger()
    def __init__(self, project_path, logger_config_template, log_format=None, date_format=None, log_types=None):
        super().__init__()
        self.project_path = project_path
        self.logger_config_template = logger_config_template
        self.log_format = log_format
        self.date_format = date_format
        self.log_types = log_types
        self.log_generators = {log_type: LoggerGenerator(self.project_path, self.logger_config_template, self.log_format, self.date_format) for log_type in log_types}
        
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
            'date_format': '%Y-%m-%d %H:%M:%S',  # todo: Example date format, customize as needed
            'handlers': ['console', 'file'],  # todo: Example handlers, customize as needed
            'filters': [],  # todo: Example filters, customize as needed
            'propagate': True,  # todo: Example propagate setting, customize as needed
            'hooks': [],  # todo: Example hooks, customize as needed
            'error_handlers': [],  # todo: Example error handlers, customize as needed
        
            # Add more configuration parameters as needed
        }
        
        
        logger_generator = start_logger_generator(project_path, logger_config_template)

        
        try:
            json_template = json.loads(self.logger_config_template.format(**config_data))
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON format in logger_config_template")
            return None

        return self.configure_logger(json_template)


    def configure_logger(self, config_data):
        logger = logging.getLogger(config_data['logger_name'])
        logger.setLevel(logging.getLevelName(config_data['log_level']))
        
        # Add more configuration options here if needed
        file_handler = configure_file_handler(self.log_format, self.date_format)
        logger.addHandler(file_handler)

        flake8_handler = configure_flake8_handler()
        logger.addHandler(flake8_handler)

        # Store the logger in the loggers dictionary
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

def start_logger_generator(project_path, logger_config_template, log_format=None, date_format=None):
    logger_generator = LoggerGenerator(project_path, logger_config_template, log_format, date_format)
    observer = Observer()
    observer.schedule(logger_generator, path=project_path, recursive=True)
    observer.start()

    try:
        while True:
            # You can add additional logic or checks here
            if overall_low_activity_condition:
                time.sleep(10)
            else:
                time.sleep(1)
    except KeyboardInterrupt:
        pass
    except Exception as e:
        logging.error(f"An error occurred: {e}")
    finally:
        observer.stop()
        observer.join()
    return logger_generator


if __name__ == "__main__":
    # Example usage
    project_path = 'path/to/your/project'
    logger_config_template = """
    {{
        "name": "{logger_name}",
        "level": "{log_level}",
        // Add more configuration options here
    }}
    """
    
    
    logger_generator = start_logger_generator(project_path, logger_config_template)

    # Accessing loggers
        # # mobx
    model_generation_logger = logger_generator.loggers.get('model_generation')
    mobx_store_generation_logger = logger_generator.loggers.get('mobx_store_generation')
    model_generation_logger = logger_generator.loggers.get('model_generation')
    mobx_store_generation_logger = logger_generator.loggers.get('mobx_store_generation')
    file_creation_logger = logger_generator.loggers.get('file_creation')
    store_file_creation_logger = logger_generator.loggers.get('store_file_creation')
    code_generation_logger = logger_generator.loggers.get('code_generation')
    dry_run_logger = logger_generator.loggers.get('dry_run')
