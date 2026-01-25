from flask import Flask, jsonify, request
from flask_limiter import Limiter

from configs.config import app
from models.user.get_remote_address import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@limiter.limit("5 per hour", error_message="File upload limit exceeded.")
@app.route('/upload-file', methods=['POST'])
def upload_file():
    # Your file upload logic here
    return jsonify({"message": "File uploaded successfully!"})
