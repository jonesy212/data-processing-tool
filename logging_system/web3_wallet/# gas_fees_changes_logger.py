# gas_fees_changes_logger.py

import logging


class GasFeesChangesLogger:
    def __init__(self, log_file_path="gas_fees_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_gas_fees_change(self, change_description):
        """
        Log a gas fees-related change.

        Parameters:
            change_description (str): Description of the gas fees change.
        """
        logging.info(f"Gas Fees Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    # Simulate receiving a gas fees change
    change_description = "Adjusted gas fees to optimize transaction processing"
    
    # Log the gas fees change
    GasFeesChangesLogger().log_gas_fees_change(change_description)
