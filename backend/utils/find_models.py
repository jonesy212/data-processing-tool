import importlib
import inspect
import os
import re

from database.extensions import db

INTERFACE_CACHE_PATH = "interface_cache.txt"

class InterfaceManager:
    @staticmethod
    def find_models(directory='models'):
        # Function to find models in the specified directory
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

    @staticmethod
    def find_interfaces_without_backend(interfaces, backend_models):
        # Function to find interfaces without corresponding backend models
        interfaces_without_backend = []
        for interface_file in interfaces:
            interface_name = InterfaceManager.extract_interface_name(interface_file)
            if interface_name not in backend_models:
                interfaces_without_backend.append(interface_name)
        return interfaces_without_backend

    @staticmethod
    def extract_interface_name(interface_file):
        # Function to extract interface name from the file name
        match = re.match(r'^(\w+)\.ts$', interface_file)
        if match:
            return match.group(1)
        else:
            return None

    @staticmethod
    def find_and_cache_interfaces(directory):
        # Function to find and cache interfaces in the specified directory
        interface_paths = []
        for root, _, files in os.walk(directory):
            for file in files:
                if "interface" in file.lower():
                    interface_paths.append(os.path.join(root, file))
        with open(INTERFACE_CACHE_PATH, "w") as cache_file:
            for path in interface_paths:
                cache_file.write(path + "\n")

    @staticmethod
    def load_interface_cache():
        # Function to load interface cache from file
        if os.path.exists(INTERFACE_CACHE_PATH):
            with open(INTERFACE_CACHE_PATH, "r") as cache_file:
                return [line.strip() for line in cache_file.readlines()]
        return []

    @staticmethod
    def synchronize_interface_paths(current_file_directory):
        # Function to synchronize interface paths
        frontend_interface_path = os.path.join(current_file_directory, 'path', 'to', 'frontend', 'interfaces')
        interface_cache = InterfaceManager.load_interface_cache()
        if frontend_interface_path not in interface_cache:
            interface_cache.append(frontend_interface_path)
            with open(INTERFACE_CACHE_PATH, "a") as cache_file:
                cache_file.write(frontend_interface_path + "\n")
        return frontend_interface_path
