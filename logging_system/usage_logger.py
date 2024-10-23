import logging

# In your logging setup
feature_logger = logging.getLogger('feature_usage')

def log_feature_usage(feature, action, user=None):
    extra_info = {'user': user} if user else {}
    feature_logger.info(f'{action} - {feature}', extra=extra_info)

# Example usage
log_feature_usage('Dashboard', 'User viewed dashboard', user='john_doe')
log_feature_usage('Settings', 'User updated settings', user='alice')
