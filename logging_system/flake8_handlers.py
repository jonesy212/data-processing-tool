import logging
import subprocess


class Flake8Handler(logging.Handler):
    def emit(self, record):
        try:
            # Run flake8 on the code
            subprocess.run(['flake8', 'your_project_directory'], check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            # Log the flake8 output as an error
            self.handleError(record)

# Add the Flake8Handler to the root logger
logging.getLogger('').addHandler(Flake8Handler())
