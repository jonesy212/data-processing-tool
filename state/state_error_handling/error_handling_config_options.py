# error_handling_config_options.py
class ConfigOptionsError(Exception):
    pass

def handle_config_options_errors(error_type, details):
    raise ConfigOptionsError(f"Error in Configuration Options ({error_type}): {details}")
