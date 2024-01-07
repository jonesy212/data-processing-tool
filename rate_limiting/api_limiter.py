from flask import Flask, jsonify, request
from flask_limiter import Limiter

from configs.config import app
from models.user.get_remote_address import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@limiter.limit("10 per minute", error_message="API rate limit exceeded.")
@app.route('/api/some-endpoint', methods=['GET'])
def api_some_endpoint():
    # Your API logic here
    return jsonify({"message": "API response"})
