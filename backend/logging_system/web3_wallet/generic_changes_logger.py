# generic_changes_logger.py

import logging


class GenericChangesLogger:
    def __init__(self, log_file_path="generic_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_generic_change(self, change_description):
        """
        Log a generic change.

        Parameters:
            change_description (str): Description of the generic change.
        """
        logging.info(f"Generic Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    generic_logger = GenericChangesLogger()

    # Simulate receiving a generic change
    change_description = "Updated user interface with a modern design"
    
    # Log the generic change
    generic_logger.log_generic_change(change_description)
