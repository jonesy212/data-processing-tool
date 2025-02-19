from flask import Flask, jsonify, request
from flask_limiter import Limiter

from configs.config import app
from user.get_remote_address import get_remote_address

limiter = Limiter(app, key_func=get_remote_address)

@limiter.limit("2 per hour", error_message="Too many password reset requests. Try again later.")
@app.route('/reset-password', methods=['POST'])
def reset_password():
    # Your password reset logic here
    return jsonify({"message": "Password reset successful!"})
