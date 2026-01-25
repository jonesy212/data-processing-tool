import logging

# In your logging setup
error_logger = logging.getLogger('errors')

def log_error(error_message, user=None):
    extra_info = {'user': user} if user else {}
    error_logger.error(error_message, extra=extra_info)

# Example usage
log_error('Failed to load data', user='john_doe')
log_error('Invalid input submitted', user='alice')
