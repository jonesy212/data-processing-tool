# web3_libraries_changes_logger.py

import logging


class Web3LibrariesChangesLogger:
    def __init__(self, log_file_path="web3_libraries_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_web3_libraries_change(self, change_description):
        """
        Log a change related to web3 libraries.

        Parameters:
            change_description (str): Description of the web3 libraries change.
        """
        logging.info(f"Web3 Libraries Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    web3_libraries_logger = Web3LibrariesChangesLogger()

    # Simulate receiving a web3 libraries change
    change_description = "Updated web3 libraries to the latest version"
    
    # Log the web3 libraries change
    web3_libraries_logger.log_web3_libraries_change(change_description)
