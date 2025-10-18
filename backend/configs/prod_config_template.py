# prod_config_template.py

import os

# Database Configuration
DATABASE_TYPE = os.environ.get('DATABASE_TYPE', 'postgresql')
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://your_username:your_password@your_host:5432/your_database')

# Security Key
SECRET_KEY = os.environ.get('SECRET_KEY', 'your_secret_key')

# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your_jwt_secret_key')
JWT_TOKEN_LOCATION = ['headers']
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DELTA = int(os.environ.get('JWT_EXPIRATION_DELTA', 1))  # in days

# Cache Configuration
CACHE_TYPE = os.environ.get('CACHE_TYPE', 'redis')
CACHE_REDIS_HOST = os.environ.get('CACHE_REDIS_HOST', 'redis://localhost:6379/0')

# Other Configurations
# ...

# Environment Indicator
ENVIRONMENT = os.environ.get('FLASK_ENV', 'production')
