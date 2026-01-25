# app_context_helper.py
from flask import g


class AppContextHelper:
    @staticmethod
    def init_app_context(app):
        app.before_request(AppContextHelper.before_request)

    @staticmethod
    def before_request():
        # Initialize context attributes or perform any setup needed for each request
        g.current_user = None  # Placeholder for the current user; replace it with actual user handling logic

    @staticmethod
    def get_current_user():
        # Get the current user from the context
        return getattr(g, 'current_user', None)
