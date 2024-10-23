import logging

from flask import Flask, jsonify, render_template
from flask_jwt_extended import jwt_required

from blueprint_routes.handle_upload_routes import (handle_invalid_file_format,
                                                   handle_upload_failure,
                                                   handle_upload_file_missing)
from blueprint_routes.logging.logging_routes import logging_bp
from configs.config import app

# Centralized logging configuration
logging.basicConfig(level=logging.INFO)  # Set the appropriate logging level


# Custom error handler for 404 Not Found
@app.errorhandler(404)
def page_not_found(error):
    app.logger.error("404 Not Found: The requested page does not exist.")
    return render_template('404.html'), 404

# Custom error handler for other exceptions
@app.errorhandler(Exception)
def handle_exception(error):
    app.logger.exception("An unhandled exception occurred:")
    return jsonify(error="Internal Server Error"), 500

# Route that intentionally raises an exception for testing
@app.route('/error')
def raise_error():
    raise Exception("This is a test exception")

# Custom error handler for 400 Bad Request
@app.errorhandler(400)
def handle_file_upload_errors(error):
    if 'No file provided' in str(error):
        return handle_upload_file_missing()
    elif 'Invalid file format' in str(error):
        return handle_invalid_file_format()
    else:
        return handle_upload_failure()

# Centralized tracking system for todos
central_todo_list = []

# Custom error handling for specific status codes
@app.errorhandler(404)
def handle_not_found(e):
    return jsonify({'error': 'Resource not found'}), 404

# Custom error handling for JWT errors
@jwt_required.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

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


# Centralized tracking system for todos
central_todo_list = []

# Custom error handling for specific status codes
@app.errorhandler(404)
def handle_not_found(e):
    return jsonify({'error': 'Resource not found'}), 404

# Custom error handling for JWT errors
@jwt_required.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has expired'}), 401

@jwt_required.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({'error': 'Invalid token'}), 401

@jwt_required.unauthorized_loader
def unauthorized_callback(error):
    return jsonify({'error': 'Authorization required'}), 401

@jwt_required.needs_fresh_token_loader
def needs_fresh_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Fresh token required'}), 401

@jwt_required.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):
    return jsonify({'error': 'Token has been revoked'}), 401
