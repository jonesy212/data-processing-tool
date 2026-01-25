# 
import logging
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler


class AuditingLogger:
    def __init__(self, log_file='auditing.log', log_format=None, date_format=None, max_log_size=10 * 1024 * 1024, backup_count=5):
        if log_format is None:
            log_format = '{asctime} | {levelname:8} | {module}:{lineno} | {message}'
        if date_format is None:
            date_format = '%Y-%m-%d %H:%M:%S'

        self.logger = logging.getLogger('auditing_logger')
        self.logger.setLevel(logging.INFO)

        # Create a formatter
        formatter = logging.Formatter(log_format, datefmt=date_format)

        # Create a rotating file handler
        file_handler = RotatingFileHandler(log_file, maxBytes=max_log_size, backupCount=backup_count)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(formatter)

        # Add the handler to the logger
        self.logger.addHandler(file_handler)

    def log_event(self, event_message):
        self.logger.info(event_message)

if __name__ == "__main__":
    # Example usage
    auditor = AuditingLogger()

    # Log some events with timestamps
    auditor.log_event(f"User login successful at {datetime.now()}")
    auditor.log_event(f"Data modification detected at {datetime.now()}")

    # Simulate log rotation
    for i in range(100):
        auditor.log_event(f"Event {i} at {datetime.now()}")
    # Simulate log rotation
    for i in range(100):
        auditor.log_event(f"Event {i}")

    # Check the log file size and backups
    log_file_size = os.path.getsize('auditing.log') / (1024 * 1024)  # in MB
    print(f"Current log file size: {log_file_size} MB")

    # List log backups
    log_backups = [f for f in os.listdir() if f.startswith('auditing.log')]
    print(f"Log backups: {log_backups}")
