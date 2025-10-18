# auth/oauth_routes.py
from flask import Blueprint, redirect, request, url_for
from flask_oauthlib.client import OAuth

oauth_bp = Blueprint('oauth_bp', __name__)
oauth = OAuth()

# Configure OAuth provider (replace with your actual configuration)
oauth.remote_app(
    'example',
    consumer_key='your_consumer_key',
    consumer_secret='your_consumer_secret',
    request_token_params=None,
    base_url='https://api.example.com/',
    request_token_url=None,
    access_token_method='POST',
    access_token_url='https://api.example.com/oauth/access_token',
    authorize_url='https://api.example.com/oauth/authorize'
)

@oauth_bp.route('/login')
def login():
    return oauth.example.authorize(callback=url_for('oauth_bp.authorized', _external=True))

@oauth_bp.route('/login/authorized')
@oauth.example.authorized_handler
def authorized(resp):
    # Handle the response after successful authorization
    if resp is None or resp.get('access_token') is None:
        return 'Access denied: reason={} error={}'.format(
            request.args['error_reason'],
            request.args['error_description']
        )
    
    # Save the access token and other information as needed
    access_token = resp['access_token']

    # Redirect to the desired page
    return redirect(url_for('home'))
