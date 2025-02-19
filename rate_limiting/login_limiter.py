from flask import Flask, jsonify, request
from flask_limiter import Limiter

from configs.config import app
from user.get_remote_address import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@limiter.limit("3 per minute", error_message="Too many login attempts. Try again later.")
@app.route('/login', methods=['POST'])
def login():
    # Your login logic here
    return jsonify({"message": "Login successful!"})
