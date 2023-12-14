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

# # Example usage
# if __name__ == "__main__":
#     todo_logger = TodoLogger()
#     todo_logger.log_system_todo('Complete task A')
#     todo_logger.log_system_todo('Review project timeline')
