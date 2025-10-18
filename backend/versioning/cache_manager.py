import logging

from logging_system.logger_rules import LoggerRules
from logging_system.warning_events import log_error, log_exception, log_warning
from versioning.synchronize_cache_from_frontend import \
    synchronize_cache_from_frontend


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
            
            # Call synchronize_cache_from_frontend function
            synchronize_cache_from_frontend(data)  # Pass the updated data
            
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

    
    # Additional features for the productivity app
    def get_task_by_id(self, task_id):
        """
        Retrieve a task from the cache based on its ID.

        Args:
            task_id (str): The ID of the task.

        Returns:
            dict: The task data if found, None otherwise.
        """
        return self.cache_data.get(task_id)

    def update_task_status(self, task_id, new_status):
        """
        Update the status of a task in the cache.

        Args:
            task_id (str): The ID of the task.
            new_status (str): The new status of the task.
        """
        task = self.get_task_by_id(task_id)
        if task:
            task['status'] = new_status
            log_warning(f"Task {task_id} status updated to {new_status}.")
        else:
            log_warning(f"Task {task_id} not found in the cache.")

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

    # Additional features for the productivity app
    task_id = "task123"
    default_cache_manager.update_cache({task_id: {"status": "pending", "description": "Task description"}})
    
    # Retrieve and print task data by ID
    task_data = default_cache_manager.get_task_by_id(task_id)
    print(f"Task Data for ID {task_id}:", task_data)

    # Update task status
    default_cache_manager.update_task_status(task_id, "completed")
    print(f"Updated Task Data for ID {task_id}:", default_cache_manager.get_task_by_id(task_id))
