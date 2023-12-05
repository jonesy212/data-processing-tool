# wsgi.py

import subprocess

from app import app


def run_gunicorn():
    command = [
        'gunicorn',
        '-w', '4',  # Number of worker processes, adjust based on your server capacity
        '-b', '0.0.0.0:8000',  # Binding address and port
        '--timeout', '120',  # Maximum time a worker is allowed to process a request
        '--graceful-timeout', '10',  # Timeout for graceful worker shutdown
        '--log-level=info',  # Log level (info, debug, warning, etc.)
        '--access-logfile', '-',  # Log requests to stdout
        '--error-logfile', '-',  # Log errors to stderr
        'app:app',  # Replace 'your_app_module' with your actual module name
    ]

    subprocess.run(command)

if __name__ == "__main__":
    run_gunicorn()
