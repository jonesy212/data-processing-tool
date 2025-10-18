import os
import random
import string


class LoggerRules:
    @staticmethod
    def get_logger_name(module_path):
        """
        Customize this method to define how logger names are derived from module paths.
        """
        # Extract a unique part name from the file path (you may need to customize this logic)
        unique_part_name = LoggerRules.extract_unique_part_name(module_path)

        # Generate a random string of characters to add uniqueness
        random_suffix = LoggerRules.generate_random_suffix()

        # Combine the unique part name, random suffix, and a prefix to create the logger name
        logger_name = f"MyApp.{unique_part_name}_{random_suffix}"

        return logger_name

    @staticmethod
    def extract_unique_part_name(module_path):
        """
        Extract a unique part name from the module path (customize this logic).
        """
        # For example, you can take a part of the file path as the unique part name
        parts = module_path.split(os.path.sep)
        unique_part_name = "_".join(parts[-3:-1])  # Take the last two parts of the path
        return unique_part_name

    @staticmethod
    def generate_random_suffix(length=6):
        """
        Generate a random string of characters to add uniqueness.
        """
        characters = string.ascii_letters + string.digits
        random_suffix = ''.join(random.choice(characters) for _ in range(length))
        return random_suffix