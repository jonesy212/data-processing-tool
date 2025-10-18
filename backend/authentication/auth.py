# # Implement registration and login routes here
# auth.py
import hmac
import os

from flask import (Blueprint, Flask, jsonify, redirect, render_template,
                   request, url_for)
from flask_jwt_extended import jwt_required
from flask_limiter import Limiter
from flask_login import LoginManager

from models.user.get_remote_address import get_remote_address
from models.user.user import User

auth_bp = Blueprint('auth', __name__)

# Callback functions for JWT
def authentication(username, password):
    user = User.query.filter_by(username=username).first()
    if user and hmac.compare_digest(user.password.encode('utf-8'), password.encode('utf-8')):
        return {'user_id': user.id, 'tier': user.tier, 'upload_quota': user.upload_quota}

def identity(payload):
    user_id = payload('identity')
    return User.query.get(int(user_id))


jwt = jwt_required(auth_bp, authentication, identity)

login_manager = LoginManager()

def init_login_manager(app):
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))




def get_authenticated_user_id():
    """
    Get the ID of the authenticated user.

    Returns:
        int: ID of the authenticated user.
    """
    return get_jwt_identity()



limiter = Limiter(key_func=get_remote_address, default_limits=["15 per day", "5 per minute"])
    
app = Flask(__name__)
app.secret_key = os.urandom(24)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.user_loader(lambda user_id: User.query.get(int(user_id)))


from models.user.user import User
