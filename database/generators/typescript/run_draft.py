import configparser
import os

from category import get_model_class_by_name

from database.generators.async_generate_data import generate_data
from state.stores.code_generation import create_store_file


async def get_category_directory(category):
    return os.path.join('path/to/categories', category)




def get_frontend_folder():
    project_directory = os.getcwd()  # Get the current working directory
    frontend_folders = [folder for folder in os.listdir(project_directory) if os.path.isdir(os.path.join(project_directory, folder)) and folder == "frontend"]
    
    if len(frontend_folders) == 1:
        return os.path.join(project_directory, frontend_folders[0])
    elif len(frontend_folders) > 1:
        raise RuntimeError("Multiple 'frontend' folders found in the project directory.")
    else:
        raise FileNotFoundError("No 'frontend' folder found in the project directory.")

def get_file_path(category, model_name):
    try:
        frontend_folder = get_frontend_folder()
    except (RuntimeError, FileNotFoundError) as e:
        print(f"Error determining frontend folder: {e}")
        return None
    
    # Assuming a simple structure like frontend/<category>/<model_name>Store.ts
    file_path = os.path.join(frontend_folder, category, f'{model_name}Store.ts')
    
    return file_path

def get_store_path(model_name):
    # Assuming stores are in data_analysis/frontend/buddease/src/app/components/state/*
    store_path = os.path.join('data_analysis', 'frontend', 'buddease', 'src', 'app', 'components', 'state', f'{model_name}Store.ts')
    
    return store_path

async def run_draft(dry_run=False):
    if dry_run:
        print("Dry Run: Showing file creation preview.")

    # Fetch the model mapping dynamically (replace this logic with your actual source)
    model_mapping = fetch_model_mapping()

    # Ensure the necessary directories exist
    for category in model_mapping.keys():
        directory_path = get_category_directory(category)
        if not os.path.exists(directory_path):
            if not dry_run:
                os.makedirs(directory_path)
            print(f"Directory Created: {directory_path}")

    # Create TypeScript files
    for category, model_list in model_mapping.items():
        for model_name, model_class in model_list.items():
            if dry_run:
                # Print file creation preview
                file_path = get_file_path(category, model_name)
                print(f"File Preview: {file_path}")
            else:
                # Execute the actual script or save the code to TypeScript files
                try:
                    generate_and_save_ts_code(model_class, category, model_name)
                    print(f"File Created: {file_path}")
                    
                    # Also create store files
                    store_path = get_store_path(model_name)
                    create_store_file(model_class, store_path)
                    print(f"Store File Created: {store_path}")
                except Exception as e:
                    print(f"Error creating file for {model_name}: {e}")

    if not dry_run:
        print("Files successfully created.")

def generate_and_save_ts_code(model_class, dry_run=False):
    ts_code = f"class {model_class.__name__}Store {{\n"
    
    # Modify this loop based on how you want to structure the TypeScript code
    for column in model_class.__table__.columns:
        ts_code += f"  {column.name}: {type(column.type).__name__};\n"
    
    ts_code += "}\n\n"

    file_path = get_file_path(model_class)

    if dry_run:
        print(f"File Preview: {file_path}")
    else:
        # If not a dry run, actually write the TypeScript code to the file
        with open(file_path, 'w') as file:
            file.write(ts_code)
        print(f"File Created: {file_path}")
          
        
# Replace this function with your actual logic to fetch the model mapping dynamically
def fetch_model_mapping():
    # Read the model mapping from a configuration file
    config = configparser.ConfigParser()
    config.read('path/to/model_mapping.ini')  # Adjust the path accordingly

    model_mapping = {}
    for category in config.sections():
        model_mapping[category] = {}
        for model_name, model_class_name in config.items(category):
            # Assuming you have a function to dynamically get the model class by name
            model_class = get_model_class_by_name(model_class_name)
            model_mapping[category][model_name] = model_class

    return model_mapping

