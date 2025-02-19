# security_audits_changes_logger.py

import logging


class SecurityAuditsChangesLogger:
    def __init__(self, log_file_path="security_audits_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_security_audits_change(self, change_description):
        """
        Log a change related to security audits.

        Parameters:
            change_description (str): Description of the security audits change.
        """
        logging.info(f"Security Audits Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    security_audits_logger = SecurityAuditsChangesLogger()

    # Simulate receiving a security audits change
    change_description = "Completed third-party security audits for the entire system"
    
    # Log the security audits change
    security_audits_logger.log_security_audits_change(change_description)
