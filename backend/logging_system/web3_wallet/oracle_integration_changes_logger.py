# oracle_integration_changes_logger.py

import logging


class OracleIntegrationChangesLogger:
    def __init__(self, log_file_path="oracle_integration_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_oracle_integration_change(self, change_description):
        """
        Log a change related to oracle integration.

        Parameters:
            change_description (str): Description of the oracle integration change.
        """
        logging.info(f"Oracle Integration Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    oracle_integration_logger = OracleIntegrationChangesLogger()

    # Simulate receiving an oracle integration change
    change_description = "Integrated new oracle for data verification"
    
    # Log the oracle integration change
    oracle_integration_logger.log_oracle_integration_change(change_description)
