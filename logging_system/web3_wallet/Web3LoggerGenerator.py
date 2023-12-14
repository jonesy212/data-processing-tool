import os

from logging_system.generate_logger import (LoggerGenerator, LoggerRules,
                                            start_logger_generator)
from logging_system.logger_config import setup_logging


class Web3LoggerGenerator(LoggerGenerator):
    def __init__(self, project_path, logger_config_template, log_format=None, date_format=None):
        super().__init__(project_path, logger_config_template, log_format, date_format)

        def generate_web3_logger_config(self, module_path):
            # Add specific logic for web3 logger configuration
            logger_name = os.path.splitext(os.path.basename(module_path))[0]
            log_level = LoggerRules.get_log_level()

            # Web3-specific configuration options
            web3_config_data = {
                'web3_specific_option': 'value',  # Add more web3-specific options as needed
            }

            # Merge with the common configuration options
            config_data = {
                'logger_name': logger_name,
                'log_level': 'DEBUG',  # Default log level, adjust as needed
                **web3_config_data,
            }

            return self.configure_logger(config_data)

    def on_any_event(self, event):
        if event.is_directory or not event.src_path.endswith('.py'):
            return

        module_path = os.path.relpath(event.src_path, self.project_path)

        if "web3" in module_path:
            logger = self.generate_web3_logger_config(module_path)
        else:
            logger = self.generate_logger_config(module_path)

        logger_output_path = os.path.join('path/to/output/loggers', f'{os.path.splitext(module_path)[0]}_logger.json')

        with open(logger_output_path, 'w') as logger_config_file:
            logger_config_file.write(setup_logging)

        print(f"Logger configuration generated for {module_path} at {logger_output_path}")

# Example Usage
if __name__ == "__main__":
    project_path = 'path/to/your/project'
    logger_config_template = """
    {{
        "name": "{logger_name}",
        "level": "{log_level}",
        // Add more configuration options here
    }}
    """

    web3_logger_generator = Web3LoggerGenerator(project_path, logger_config_template)
    start_logger_generator(web3_logger_generator)
