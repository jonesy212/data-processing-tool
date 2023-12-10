from flask import Flask, render_template

from blueprint_routes.upload_routes import (handle_invalid_file_format,
                                            handle_upload_failure,
                                            handle_upload_file_missing)
from configs.config import app


# Custom error handler for 404 Not Found
@app.errorhandler(404)
def page_not_found(error):
    return handle_404_error(error)



@app.errorhandler(400)
def handle_file_upload_errors(error):
    if 'No file provided' in str(error):
        return handle_upload_file_missing()
    elif 'Invalid file format'  in str(error):
        return handle_invalid_file_format()
    else:
        return handle_upload_failure()



# Generic error handler for other exceptions
@app.errorhandler(Exception)
def handle_exception(error):
    # Log the exception
    app.logger.error(f"An error occurred: {str(error)}")

    # Return a custom error page
    return render_template('error.html'), 500



# Route that intentionally raises an exception for testing
@app.route('/error')
def raise_error():
    raise Exception("This is a test exception")


def handle_404_error():
    return render_template('404.html'), 404


def handle_generic_error(error):
        app.logger.error(f"An error occurred: {str(error)}")
        
        # return a custom error page
        
        return render_template('error.html'), 500