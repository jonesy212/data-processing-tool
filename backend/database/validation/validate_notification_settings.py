# utils/validation.py
def validate_notification_settings(notification_settings):
    try:
        # Replace the following line with your actual validation logic
        # For demonstration purposes, we are assuming 'notification_settings'
        # should be a dictionary containing specific keys (e.g., 'email', 'sms', 'push')
        required_keys = ['email', 'sms', 'push']

        if not isinstance(notification_settings, dict):
            return False

        for key in required_keys:
            if key not in notification_settings:
                return False

        # You can add more specific validation logic based on your requirements

        return True

    except Exception as e:
        # Log the error or handle it based on your application needs
        print(f"An error occurred during notification settings validation: {str(e)}")
        return False
