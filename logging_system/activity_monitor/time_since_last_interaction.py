from datetime import datetime, timedelta

# Assuming you have a variable tracking the last user interaction time
last_user_interaction_time = datetime.now()

def calculate_time_since_last_interaction():
    """Calculate the time duration since the last user interaction."""
    current_time = datetime.now()
    time_since_last_interaction = current_time - last_user_interaction_time
    return time_since_last_interaction
