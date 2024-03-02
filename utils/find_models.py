# Add this at the top of your script or in a separate module
import importlib
import inspect
import os
import re

from database.extensions import db

INTERFACE_CACHE_PATH = "interface_cache.txt"


def find_models(directory='models'):
    models = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                module_name = os.path.splitext(file)[0]  # Extracting module name without extension
                module_path = os.path.relpath(os.path.join(root, file))
                package = os.path.splitext(module_path.replace(os.sep, '.'))[0]
                module = importlib.import_module(package)
                for name, obj in inspect.getmembers(module):
                    if inspect.isclass(obj) and issubclass(obj, db.Model):
                        models.append(obj)
    return models






def find_models_without_backend(models):
    models_without_backend = []
    for model_class in models:
        if not model_class.__table__.exists():
            models_without_backend.append(model_class)
    return models_without_backend



def extract_interface_name(interface_file):
    # Extract the interface name from the file name using regular expression
    match = re.match(r'^(\w+)\.ts$', interface_file)
    if match:
        return match.group(1)
    else:
        return None
    

def find_and_cache_interfaces(directory):
    interface_paths = []
    for root, _, files in os.walk(directory):
        for file in files:
            if "interface" in file.lower():
                interface_paths.append(os.path.join(root, file))
    with open(INTERFACE_CACHE_PATH, "w") as cache_file:
        for path in interface_paths:
            cache_file.write(path + "\n")

def load_interface_cache():
    if os.path.exists(INTERFACE_CACHE_PATH):
        with open(INTERFACE_CACHE_PATH, "r") as cache_file:
            return [line.strip() for line in cache_file.readlines()]
    return []

def synchronize_interface_paths(current_file_directory):
    frontend_interface_path = os.path.join(current_file_directory, 'path', 'to', 'frontend', 'interfaces')
    interface_cache = load_interface_cache()
    if frontend_interface_path not in interface_cache:
        interface_cache.append(frontend_interface_path)
        with open(INTERFACE_CACHE_PATH, "a") as cache_file:
            cache_file.write(frontend_interface_path + "\n")
    return frontend_interface_path
   
def find_interfaces_without_frontend(interfaces, backend_models):
    # Assuming interfaces is a list of frontend files
    interfaces_without_frontend = []
    # Iterate over interfaces and check if each has corresponding backend models
    for interface_file in interfaces:
        interface_name = extract_interface_name(interface_file)
        if interface_name not in backend_models:
            interfaces_without_frontend.append(interface_name)
    return interfaces_without_frontend

# Use the functions in your code as needed
current_file_directory = os.path.dirname(os.path.abspath(__file__))
frontend_interface_path = synchronize_interface_paths(current_file_directory)
find_and_cache_interfaces(frontend_interface_path)
   
 