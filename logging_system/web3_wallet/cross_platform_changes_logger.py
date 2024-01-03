# cross_platform_changes_logger.py

import logging


class CrossPlatformChangesLogger:
    def __init__(self, log_file_path="cross_platform_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_cross_platform_change(self, change_description):
        """
        Log a change related to cross-platform compatibility.

        Parameters:
            change_description (str): Description of the cross-platform change.
        """
        logging.info(f"Cross-Platform Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    cross_platform_logger = CrossPlatformChangesLogger()

    # Simulate receiving a cross-platform change
    change_description = "Enhanced compatibility for multiple operating systems"
    
    # Log the cross-platform change
    cross_platform_logger.log_cross_platform_change(change_description)
