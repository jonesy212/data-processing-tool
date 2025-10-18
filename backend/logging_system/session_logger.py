import logging

# In your logging setup
session_logger = logging.getLogger('session')

def log_session_event(event, user=None):
    extra_info = {'user': user} if user else {}
    session_logger.info(event, extra=extra_info)

# Example usage
log_session_event('User logged in', user='john_doe')
log_session_event('User logged out', user='alice')
