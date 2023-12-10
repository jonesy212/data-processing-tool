import logging

# In your logging setup
navigation_logger = logging.getLogger('navigation')

def log_navigation(action, user=None):
    extra_info = {'user': user} if user else {}
    navigation_logger.info(action, extra=extra_info)

# Example usage
log_navigation('User started process X', user='john_doe')
log_navigation('User completed process Y', user='alice')
