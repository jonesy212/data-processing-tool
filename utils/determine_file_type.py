import logging
import os

from logging_system.log_todos import TodoLogger
from logging_system.warning_events import log_error, log_info, log_warning

# Initialize your custom logging system
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the TodoLogger
todo_logger = TodoLogger()

# Connect the TodoLogger to the root logger
todo_logger.connect_logger(logger)

def determine_file_type(directory_path):
    backend_extensions = {".py", ".js", ".ts", ".jsx", ".tsx"}
    frontend_extensions = {".js", ".ts", ".jsx", ".tsx"}
    recognized_extensions = backend_extensions.union(frontend_extensions)

    backend_count = 0
    frontend_count = 0
    unknown_count = 0

    for filename in os.listdir(directory_path):
        _, file_extension = os.path.splitext(filename)

        if file_extension in recognized_extensions:
            if file_extension in backend_extensions:
                backend_count += 1
            elif file_extension in frontend_extensions:
                frontend_count += 1
        else:
            unknown_count += 1

    if backend_count > frontend_count and backend_count > unknown_count:
        logger.info("Detected majority as backend files.")
        return "backend"
    elif frontend_count > backend_count and frontend_count > unknown_count:
        logger.info("Detected majority as frontend files.")
        return "frontend"
    else:
        todo_logger.warning("Unknown file type or equal occurrences. Unable to determine majority.")

def generate_file_based_on_type(file_type):
    if file_type == "backend":
        logger.info("Generating backend file...")
        # Generate backend file (e.g., .py, .js, .ts, .jsx, .tsx)
    elif file_type == "frontend":
        logger.info("Generating frontend file...")
        # Generate frontend file (e.g., .js, .ts, .jsx, .tsx)
    else:
        todo_logger.warning("Unknown file type. Unable to generate.")

if __name__ == "__main__":
    directory_path = "/path/to/code/directory"
    logger.info(f"Analyzing code in directory: {directory_path}")
    code_type = determine_file_type(directory_path)
    generate_file_based_on_type(code_type)
