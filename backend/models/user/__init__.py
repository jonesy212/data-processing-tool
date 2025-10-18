# models/user/__init__.py
from ...blueprint_routes.user.user_feedback_route import UserFeedback
from .get_remote_address import get_remote_address
from .user import User
from .user_activity_log import \
    UserActivityLog  # Add this line to import UserActivityLog
from .user_history import UserHistory  # Add this line to import UserHistory
from .user_support import UserSupport
