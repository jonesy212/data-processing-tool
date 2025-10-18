import json
import logging
import os
import time

from watchdog.observers import Observer

from logging_system.activity_monitor.conditions import \
    overall_low_activity_condition
from logging_system.generate_logger import LoggerGenerator
from logging_system.logger_rules import LoggerRules
from logging_system.web3_wallet.web3_libraries_changes_logger import \
    Web3LibrariesChangesLogger


class Web3LoggerGenerator(LoggerGenerator):
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

        # Add web3-specific configuration options
        config_data['web3_specific_option'] = 'value'

        try:
            json_template = json.loads(self.logger_config_template.format(**config_data))
        except json.JSONDecodeError:
            print(f"Error: Invalid JSON format in logger_config_template")
            return None

            # Customize the logger configuration if needed
        # For example: web3_logger.some_method()

        return self.configure_logger(json_template)

    def start_web3_logging(self):
        web3_logger = Web3LibrariesChangesLogger()  # Initialize Web3 logger
        # You can perform any necessary operations with web3_logger here
        # For example, logging changes related to Web3 libraries
        web3_logger.log_changes()  # Example: Logging changes related to Web3 libraries

def start_logger_generator(project_path, logger_config_template, log_format=None, date_format=None):
    logger_generator = LoggerGenerator(project_path, logger_config_template, log_format, date_format)
    observer = Observer()
    observer.schedule(logger_generator, path=project_path, recursive=True)
    observer.start()

    try:
        while True:
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
    project_path = 'path/to/your/project'
    logger_config_template = """
    {
        "name": "{logger_name}",
        "level": "{log_level}"
    }
    """

    logger_generator = start_logger_generator(project_path, logger_config_template)

    # Accessing loggers
    model_generation_logger = logger_generator.loggers.get('model_generation')
    mobx_store_generation_logger = logger_generator.loggers.get('mobx_store_generation')
    file_creation_logger = logger_generator.loggers.get('file_creation')
    store_file_creation_logger = logger_generator.loggers.get('store_file_creation')
    code_generation_logger = logger_generator.loggers.get('code_generation')
    dry_run_logger = logger_generator.loggers.get('dry_run')
