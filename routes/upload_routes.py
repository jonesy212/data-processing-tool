# routes/upload_routes.py
from flask import render_template


def handle_upload_file_missing():
    return render_template('upload_error.html', message='No file provided'), 400

def handle_invalid_file_format():
    return render_template('upload_error.html', message='Invalid file format'), 400

def handle_upload_failure():
    return render_template('upload_error.html', message='Failed to upload the file'), 500
