import logging

# In your logging setup
data_processing_logger = logging.getLogger('data_processing')

def log_data_processing_event(event, details=None):
    extra_info = {'details': details} if details else {}
    data_processing_logger.info(event, extra=extra_info)

# Example usage
log_data_processing_event('Data loading started', details={'file': 'data.csv'})
log_data_processing_event('Data transformation completed')
