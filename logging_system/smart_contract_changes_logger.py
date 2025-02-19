# smart_contract_changes_logger.py

import logging


class SmartContractChangesLogger:
    def __init__(self, log_file_path="smart_contract_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_smart_contract_change(self, change_description):
        """
        Log a smart contract-related change.

        Parameters:
            change_description (str): Description of the smart contract change.
        """
        logging.info(f"Smart Contract Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    # Simulate receiving a smart contract change
    change_description = "Implemented new smart contract functionality"
    
    # Log the smart contract change
    SmartContractChangesLogger().log_smart_contract_change(change_description)
