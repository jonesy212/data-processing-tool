import logging

from logging_system.logger_handlers import (configure_file_handler,
                                            configure_flake8_handler)


class TodoLogger:
    def __init__(self, logger_name='todos', log_file_path='todos.log', log_level=logging.INFO):
        self.logger = logging.getLogger(logger_name)
        self.logger.setLevel(log_level)

        # Configure file handler
        file_handler = configure_file_handler(log_format='{asctime} - {levelname} - {message}',
                                              date_format='%Y-%m-%d %H:%M:%S',
                                              log_file=log_file_path)
        self.logger.addHandler(file_handler)

        # Configure Flake8Handler
        flake8_handler = configure_flake8_handler()
        self.logger.addHandler(flake8_handler)

    def log_system_todo(self, todo_message):
        self.logger.info(todo_message)

    def log_warning(self, warning_message):
        self.logger.warning(warning_message)

    def log_error(self, error_message):
        self.logger.error(error_message)

    def log_debug(self, debug_message):
        self.logger.debug(debug_message)

    def log_critical(self, critical_message):
        self.logger.critical(critical_message)

    def log_exception(self, exception_message, exc_info=True):
        self.logger.exception(exception_message, exc_info=exc_info)

# Example usage
if __name__ == "__main__":
    todo_logger = TodoLogger()
    todo_logger.log_system_todo('Complete task A')
    todo_logger.log_warning('Incomplete task B')
    todo_logger.log_error('Error in task C')
    todo_logger.log_debug('Debugging task D')
    todo_logger.log_critical('Critical issue in task E')

    try:
        # Some code that may raise an exception
        raise ValueError("An example exception")
    except ValueError as e:
        todo_logger.log_exception('Caught an exception:', exc_info=True)
