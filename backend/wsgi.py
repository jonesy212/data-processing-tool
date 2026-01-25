# wsgi.py
import subprocess

from gunicorn.app.base import BaseApplication

from configs.config import app


class GunicornApplication(BaseApplication):
    def __init__(self, app, options=None):
        self.options = options or {}
        self.application = app
        super().__init__()

    def load_config(self):
        config = {key: value for key, value in self.options.items() if key in self.cfg.settings and value is not None}
        for key, value in config.items():
            self.cfg.set(key.lower(), value)

    def load(self):
        return self.application


def run_gunicorn():
    options = {
        'bind': '0.0.0.0:8000',
        'workers': 4,
        'timeout': 120,
        'graceful_timeout': 10,
        'loglevel': 'info',
        'accesslog': '-',
        'errorlog': '-',
    }

    gunicorn_app = GunicornApplication(app, options)
    gunicorn_app.run()

if __name__ == "__main__":
    run_gunicorn()
