from flask import Flask, jsonify, request
from flask_jwt_extended import current_user
from flask_limiter import Limiter

from authentication.auth import register
from configs.config import app
from models.user.get_remote_address import get_remote_address
from models.user.user import User
# Import the tier system module
from utils.user_utils.tier_system import get_user_tier

limiter = Limiter(app, key_func=get_remote_address)

# Define rate limits for each tier
RATE_LIMITS = {
    'free': "5 per minute",
    'standard': "10 per minute",
    'premium': "20 per minute",
    'enterprise': "30 per minute",
}

def get_rate_limit(tier):
    return RATE_LIMITS.get(tier, "5 per minute")  # Default to a reasonable limit for unknown tiers

@app.route('/some-protected-endpoint', methods=['GET'])
def some_protected_endpoint():
    user_subscription_type = 'standard'  # You need to replace this with the actual user's subscription type
    user_tier = get_user_tier(user_subscription_type)
    rate_limit = get_rate_limit(user_tier.name)

    @limiter.limit(rate_limit, error_message=f"Rate limit exceeded for tier '{user_tier.name}'. Try again later.")
    def protected_logic():
        # Your protected logic here
        return jsonify({"message": "Protected endpoint response"})

    return protected_logic()




@limiter.request_filter
def rate_limit_user():
    return str(current_user.id) if current_user.is_authenticated else None

@limiter.request_filter
def rate_limit_by_role():
    return current_user.role if current_user.is_authenticated else None

# Set dynamic rate limits based on user roles
limiter.limit("5 per minute", key_func=rate_limit_user)(register)
#todo set up route for roled based limits
limiter.limit("10 per minute", key_func=rate_limit_by_role)(some_other_route)
