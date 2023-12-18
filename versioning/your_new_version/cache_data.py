import logging

from logging_system.logger_rules import LoggerRules


class CacheManager:
    def __init__(self, cache_name="default_cache"):
        self.cache_name = cache_name
        self.logger = logging.getLogger(LoggerRules.get_logger_name(__file__))

        # Additional features
        self.cache_data = {}

    def update_cache(self, data):
        """
        Update the cache with new data.

        Args:
            data (dict): The data to be added to the cache.
        """
        try:
            # Your cache update logic
            self.cache_data.update(data)
            self.logger.info(f"{self.cache_name} cache updated successfully.")
        except Exception as e:
            self.logger.error(f"Failed to update {self.cache_name} cache. Error: {e}")

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
        self.logger.info(f"{self.cache_name} cache cleared.")

# Example usage
if __name__ == "__main__":
    # Initialize a default cache manager
    default_cache_manager = CacheManager()

    # Update the default cache
    default_cache_manager.update_cache({"key1": "value1", "key2": "value2"})

    # Get and print the current cache data
    print("Default Cache Data:", default_cache_manager.get_cache_data())

    # Initialize a custom-named cache manager
    custom_cache_manager = CacheManager(cache_name="custom_cache")

    # Update the custom cache
    custom_cache_manager.update_cache({"key3": "value3", "key4": "value4"})

    # Get and print the current cache data for the custom cache
    print("Custom Cache Data:", custom_cache_manager.get_cache_data())
