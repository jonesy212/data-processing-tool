from flask_wtf.csrf import CSRFProtect

from configs.config import app

csrf = CSRFProtect(app)
