import logging

# In your logging setup
performance_logger = logging.getLogger('performance')

def log_performance(metric, value, user=None):
    extra_info = {'user': user} if user else {}
    performance_logger.info(f'{metric}: {value}', extra=extra_info)

# Example usage
log_performance('Response Time', '500 ms', user='john_doe')
log_performance('Memory Usage', '50 MB', user='alice')
