# Add this at the top of your script or in a separate module
import importlib
import inspect
import os

from database.extensions import db


def find_models(directory='models'):
    models = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                module_name = os.path.splitext(file)[0]
                module = importlib.import_module(f'{directory}.{module_name}')
                for name, obj in inspect.getmembers(module):
                    if inspect.isclass(obj) and issubclass(obj, db.Model):
                        models.append(obj)
    return models
