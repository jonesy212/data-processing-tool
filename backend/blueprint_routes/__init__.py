# blueprints/__init__.py
from flask import Blueprint

# Create blueprints here
auth_bp = Blueprint('auth_bp', __name__)
notification_bp = Blueprint('notification_bp', __name__)
company_bp = Blueprint('company_bp', __name__)
data_analysis_bp = Blueprint('data_analysis_bp', __name__)
data_bp = Blueprint('data_bp', __name__)
dashboard_bp = Blueprint('dashboard_bp', __name__)
dashboard_layouts_bp = Blueprint('dashboard_layouts_bp', __name__)
onboarding_bp = Blueprint('onboarding_bp', __name__)
onboarding_pages_bp = Blueprint('onboarding_pages_bp', __name__)
profile_setup_bp = Blueprint('profile_setup_bp', __name__)
prompt_bp = Blueprint('prompt_bp', __name__)
recruiter_bp = Blueprint('recruiter_bp', __name__)
recruiter_dashboard_bp = Blueprint('recruiter_dashboard_bp', __name__)
screen_functionality_bp = Blueprint('screen_functionality_bp', __name__)
search_bp = Blueprint('search_bp', __name__)
search_pages_bp = Blueprint('search_pages_bp', __name__)
support_response_bp = Blueprint('support_response_bp', __name__)
task_bp = Blueprint('task_bp', __name__)
todo_bp = Blueprint('todo_bp', __name__)
tutorial_bp = Blueprint('tutorial_bp', __name__)
upload_bp = Blueprint('upload_bp', __name__)
user_bp = Blueprint('user_bp', __name__)
user_history_bp = Blueprint('user_history_bp', __name__)
verify_email_bp = Blueprint('verify_email_bp', __name__)
video_bp = Blueprint('video_bp', __name__)
welcome_bp = Blueprint('welcome_bp', __name__)







nlp_bp = Blueprint('nlp_bp', __name__)

