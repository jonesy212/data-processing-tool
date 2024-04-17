import logging
import os
import random  # Import the random module
import shutil
import time

from flask import current_app
from sqlalchemy import func

from models import RandomTable

# Configure logging
logging.basicConfig(filename='backup.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Function to perform automated backups
def perform_backup():
    # Retrieve source and backup directories from configuration
    source_directory = current_app.config.get('SOURCE_DIRECTORY')
    backup_directory = current_app.config.get('BACKUP_DIRECTORY')

    if not source_directory or not backup_directory:
        logging.error("Source directory or backup directory not configured.")
        return

    # Create a timestamp for the backup folder
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    backup_folder = os.path.join(backup_directory, f"backup_{timestamp}")

    try:
        # Create the backup folder
        os.makedirs(backup_folder)

        # Copy database files from source directory to backup directory
        for file_name in os.listdir(source_directory):
            file_path = os.path.join(source_directory, file_name)
            if os.path.isfile(file_path):
                shutil.copy(file_path, backup_folder)
        
        logging.info(f"Backup created successfully at: {backup_folder}")
        print(f"Backup created successfully at: {backup_folder}")

    except Exception as e:
        logging.error(f"Error creating backup: {e}")
        print(f"Error creating backup: {e}")

# Function to perform disaster recovery
def restore_backup():
    # Retrieve backup and restore directories from configuration
    backup_directory = current_app.config.get('BACKUP_DIRECTORY')
    restore_directory = current_app.config.get('RESTORE_DIRECTORY')

    if not backup_directory or not restore_directory:
        logging.error("Backup directory or restore directory not configured.")
        return

    try:
        # Find the latest backup folder
        latest_backup = max(os.listdir(backup_directory), key=os.path.getctime)
        backup_folder = os.path.join(backup_directory, latest_backup)

        # Restore database files from backup folder to restore directory
        for file_name in os.listdir(backup_folder):
            file_path = os.path.join(backup_folder, file_name)
            if os.path.isfile(file_path):
                shutil.copy(file_path, restore_directory)
        
        logging.info(f"Disaster recovery completed successfully using backup: {latest_backup}")
        print(f"Disaster recovery completed successfully using backup: {latest_backup}")

    except Exception as e:
        logging.error(f"Error performing disaster recovery: {e}")
        print(f"Error performing disaster recovery: {e}")

# Function to simulate database corruption by modifying data directly in the database
def simulate_data_corruption():
    # Retrieve database connection or ORM session object from current app context
    db_connection = current_app.db_connection  # Example: SQLAlchemy session object
    
    try:
        # Select a random record from a database table
        random_record = db_connection.query(RandomTable).order_by(func.random()).first()
        
        
          
        # Define a list of corrupted values
        corrupted_values = [
            "missing_data",
            "data_out_of_range",
            "invalid_format",
            "inconsistent_data",
            "duplicate_entries",
            "incorrect_calculation",
            "data_loss",
            "corrupted_schema",
            "incomplete_records",
            "data_security_breach"
        ]

        # Choose a random value from the list and assign it to the selected record
        random_record.column_name = random.choice(corrupted_values)
      
        # Modify data in the selected record to simulate corruption
        random_record.column_name = "corrupted_value"
        
        # Commit the changes to the database
        db_connection.commit()
        
        logging.info("Simulated data corruption: Record updated successfully.")
        print("Simulated data corruption: Record updated successfully.")
    
    except Exception as e:
        # Rollback the transaction in case of errors
        db_connection.rollback()
        
        logging.error(f"Error simulating data corruption: {e}")
        print(f"Error simulating data corruption: {e}")

# Example usage
if __name__ == "__main__":
    # Perform automated backup
    perform_backup()

    # Simulate a disaster scenario (e.g., database corruption)
    print("Simulating database corruption...")
    time.sleep(2)

    # Perform disaster recovery
    restore_backup()

    # Simulate data corruption
    simulate_data_corruption()
