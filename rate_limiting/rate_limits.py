@limiter.request_filter
def rate_limit_user():
    return str(current_user.id) if current_user.is_authenticated else None

@limiter.request_filter
def rate_limit_by_role():
    return current_user.role if current_user.is_authenticated else None

# Set dynamic rate limits based on user roles
limiter.limit("5 per minute", key_func=rate_limit_user)(register)
limiter.limit("10 per minute", key_func=rate_limit_by_role)(some_other_route)
