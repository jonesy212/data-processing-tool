from flask import Flask, jsonify, request
from flask_limiter import Limiter

from configs.config import app
from user.get_remote_address import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@limiter.limit("20 per minute", error_message="Search rate limit exceeded.")
@app.route('/search', methods=['GET'])
def search():
    # Your search logic here
    return jsonify({"message": "Search results"})
