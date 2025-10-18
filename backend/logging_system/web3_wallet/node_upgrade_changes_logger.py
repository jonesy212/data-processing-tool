# node_upgrade_changes_logger.py

import logging


class NodeUpgradeChangesLogger:
    def __init__(self, log_file_path="node_upgrade_changes.log"):
        # Set up logger configuration
        logging.basicConfig(filename=log_file_path, level=logging.INFO,
                            format="%(asctime)s - %(levelname)s - %(message)s")

    def log_node_upgrade_change(self, change_description):
        """
        Log a change related to node upgrades.

        Parameters:
            change_description (str): Description of the node upgrade change.
        """
        logging.info(f"Node Upgrade Change: {change_description}")

# Example Usage
if __name__ == "__main__":
    node_upgrade_logger = NodeUpgradeChangesLogger()

    # Simulate receiving a node upgrade change
    change_description = "Upgraded to the latest version of the blockchain node software"
    
    # Log the node upgrade change
    node_upgrade_logger.log_node_upgrade_change(change_description)
