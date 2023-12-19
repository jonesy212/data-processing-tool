import logging

from logging_system.logger_rules import LoggerRules
from logging_system.warning_events import log_error, log_exception, log_warning


class CacheManager:
    def __init__(self, cache_name="default_cache"):
        self.cache_name = cache_name
        self.logger = logging.getLogger(LoggerRules.get_logger_name(__file__))

        # Additional features
        self.cache_data = {}
        self.unique_constraints = {}

    def update_cache(self, data):
        """
        Update the cache with new data.

        Args:
            data (dict): The data to be added to the cache.
        """
        try:
            if not isinstance(data, dict):
                raise ValueError("Data must be a dictionary.")

            # Check unique constraints before updating the cache
            if not self.check_unique_constraints(data):
                raise ValueError("Unique constraints violated. Regenerate data with unique values.")

            # Your cache update logic
            self.cache_data.update(data)
            log_warning(f"{self.cache_name} cache updated successfully.")
        except Exception as e:
            log_exception(f"Failed to update {self.cache_name} cache. Error: {e}")

    def check_unique_constraints(self, data):
        """
        Check if the data violates unique constraints.

        Args:
            data (dict): The data to be checked.

        Returns:
            bool: True if the data does not violate unique constraints, False otherwise.
        """
        for key, value in data.items():
            if key in self.unique_constraints:
                if value in self.unique_constraints[key]:
                    # Collision detected
                    return False
                else:
                    # Add the value to the unique constraints
                    self.unique_constraints[key].add(value)
            else:
                self.unique_constraints[key] = {value}

        return True

    def get_cache_data(self):
        """
        Retrieve the current cache data.

        Returns:
            dict: The current cache data.
        """
        return self.cache_data

    def clear_cache(self):
        """Clear the cache."""
        self.cache_data = {}
        self.unique_constraints = {}
        log_warning(f"{self.cache_name} cache cleared.")

# Example usage
if __name__ == "__main__":
    # Initialize a default cache manager
    default_cache_manager = CacheManager()

    # Update the default cache with unique values
    default_cache_manager.update_cache({"key1": "value1", "key2": "value2"})

    # Try updating the default cache with a value violating unique constraint
    default_cache_manager.update_cache({"key3": "value1", "key4": "value4"})  # This will raise an error

    # Get and print the current cache data
    print("Default Cache Data:", default_cache_manager.get_cache_data())

    # Initialize a custom-named cache manager
    custom_cache_manager = CacheManager(cache_name="custom_cache")

    # Update the custom cache with unique values
    custom_cache_manager.update_cache({"key3": "value3", "key4": "value4"})

    # Get and print the current cache data for the custom cache
    print("Custom Cache Data:", custom_cache_manager.get_cache_data())
