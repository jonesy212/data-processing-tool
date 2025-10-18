# dapp_changes_logger.py

import logging


class DappChangesLogger:
    def __init__(self, log_file_path="dapp_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_dapp_change(self, change_description):
        """
        Log a decentralized application (DApp)-related change.

        Parameters:
            change_description (str): Description of the DApp change.
        """
        logging.info(f"DApp Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    # Simulate receiving a DApp change
    change_description = "Updated user interface for the decentralized application"
    
    # Log the DApp change
    DappChangesLogger().log_dapp_change(change_description)
