# eip_changes_logger.py

import logging


class EIPChangesLogger:
    def __init__(self, log_file_path="eip_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_eip_change(self, change_description):
        """
        Log a change related to Ethereum Improvement Proposals (EIP).

        Parameters:
            change_description (str): Description of the EIP change.
        """
        logging.info(f"EIP Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    eip_logger = EIPChangesLogger()

    # Simulate receiving an EIP change
    change_description = "Implemented EIP-1559 to improve transaction fee mechanism"
    
    # Log the EIP change
    eip_logger.log_eip_change(change_description)
