from flask import request

from models.user import User


# Function to get paginated users
def get_paginated_users(page, per_page):
    
    paginated_users = User.query.paginate(page=page, per_page=per_page, error_out=False)
    return paginated_users


def get_pagination_parameters():
    """
    Get page and per_page from the request query parameters.

    Returns:
        Tuple: A tuple containing page and per_page values.
    """
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    return page, per_page
