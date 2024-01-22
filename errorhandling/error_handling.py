import logging

from flask import Flask, jsonify, render_template

from blueprint_routes.handle_upload_routes import (handle_invalid_file_format,
                                                   handle_upload_failure,
                                                   handle_upload_file_missing)
from configs.config import app

# Centralized logging configuration
logging.basicConfig(level=logging.INFO)  # Set the appropriate logging level

# Custom error handler for 404 Not Found
def handle_404_error():
    app.logger.error("404 Not Found: The requested page does not exist.")
    return render_template('404.html'), 404

# Custom error handler for other exceptions
def handle_generic_error(error):
    app.logger.error(f"An error occurred: {str(error)}")
    # Return a custom error page or JSON response
    return jsonify(error=str(error)), 500

# Generic error handler for other exceptions
@app.errorhandler(Exception)
def handle_exception(error):
    # Log the exception with details
    app.logger.exception("An unhandled exception occurred:")
    # Return a consistent error response
    return jsonify(error="Internal Server Error"), 500

# Route that intentionally raises an exception for testing
@app.route('/error')
def raise_error():
    raise Exception("This is a test exception")

# Custom error handler for 404 Not Found
@app.errorhandler(404)
def page_not_found(error):
    return handle_404_error()

# Custom error handler for 400 Bad Request
@app.errorhandler(400)
def handle_file_upload_errors(error):
    if 'No file provided' in str(error):
        return handle_upload_file_missing()
    elif 'Invalid file format' in str(error):
        return handle_invalid_file_format()
    else:
        return handle_upload_failure()
