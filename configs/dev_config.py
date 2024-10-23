# dev_config.py

import os

basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'development_data.db')
CACHE_TYPE = 'simple'
