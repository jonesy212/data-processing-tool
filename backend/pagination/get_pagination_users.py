from flask import request

from models.team.team import Team
from models.user import User


def dynamic_comments(func):
    def wrapper(*args, **kwargs):
        """
        Dynamic comment generator based on the function signature.
        """
        return func(*args, **kwargs)
    return wrapper


@dynamic_comments
def get_paginated_users(page, per_page):
    paginated_users = User.query.paginate(page=page, per_page=per_page, error_out=False)
    return paginated_users


def get_pagination_parameters():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    return page, per_page


@dynamic_comments
def get_paginated_teams(page, per_page):
    paginated_teams = Team.query.paginate(page=page, per_page=per_page, error_out=False)
    return paginated_teams

# Function to get paginated users
def get_paginated_users(page, per_page):
    """
    Get paginated teams from the database.

    Args:
        page (int): The page number.
        per_page (int): The number of items per page.

    Returns:
        Pagination: A Paginated result containing users.
    """
    
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


def get_paginated_users(page, per_page):
    
    paginated_users = Team.query.paginate(page=page, per_page=per_page, error_out=False)
    return paginated_users



def get_paginated_teams(page, per_page):
    """
    Get paginated teams from the database.

    Args:
        page (int): The page number.
        per_page (int): The number of items per page.

    Returns:
        Pagination: A Paginated result containing teams.
    """
    paginated_teams = Team.query.paginate(page=page, per_page=per_page, error_out=False)
    return paginated_teams
