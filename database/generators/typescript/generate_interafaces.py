# generate_interfaces.py
import os
import re

from typescript.generate_typescript_code import generate_typescript_code

from database.generate_fake_data import generate_fake_data
from database.generators.typescript.generate_typescript_code import \
    get_typescript_type
import os
import shutil


# Update this with the actual path
current_file_directory = os.path.dirname(os.path.abspath(__file__))
frontend_interface_path = os.path.join(current_file_directory, 'path', 'to', 'frontend', 'interfaces')
dist_directory = os.path.join(current_file_directory, 'dist')  # New directory for generated files

fake_data = generate_fake_data()

models = [ModelClass1, ModelClass2, ...]  # Define your model classes
dry_run = False  # Set dry_run flag if needed

# Call generate_typescript_code function and capture returned generated_files
generated_files = generate_typescript_code(models, fake_data, dry_run)

# Define a function to dynamically determine the path to the frontend interfaces folder
def get_frontend_interface_path():
    current_file_directory = os.path.dirname(os.path.abspath(__file__))
    frontend_interface_path = os.path.join(current_file_directory, 'path', 'to', 'frontend', 'interfaces')
    return frontend_interface_path

frontendInterfacePath = get_frontend_interface_path()



def generate_interface_code(model_class):
    # Generate the interface code based on the model class properties
    interface_code = f"export interface {model_class.__name__} {{\n"
    
    # Iterate over the columns of the model class
    for column in model_class.__table__.columns:
        # Define TypeScript properties based on SQLAlchemy column types
        ts_type = get_typescript_type(column.type)
        interface_code += f"  {column.name}: {ts_type};\n"
    
    interface_code += "}"
    
    return interface_code


def generate_typescript_code(models, fake_data, dry_run=False, generated_files=None):
    if generated_files is None:
        generated_files = []

    for model_class in models:
        # Check if the interface file exists
        interface_path = os.path.join(frontendInterfacePath, f"{model_class.__name__}.ts")

        if not os.path.exists(interface_path):
            # Generate the interface code
            ts_code = generate_interface_code(model_class, fake_data.get(model_class, []))

            # Save the interface code to the file if not in dry run mode
            if not dry_run:
                with open(interface_path, 'w') as file:
                    file.write(ts_code)

            # Append the interface path to generated_files list
            generated_files.append(interface_path)





# Function to find interfaces in a directory
def find_interfaces(directory):
    interfaces = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r') as f:
                    content = f.read()
                    # Use regular expression to find interfaces
                    matches = re.findall(r'(?:export\s+)?interface\s+(\w+)\s*{', content)
                    interfaces.extend(matches)
    return interfaces

# Function to synchronize interface paths
def synchronize_interface_paths(interface_cache, frontend_interface_path):
    for interface_name in interface_cache:
        interface_filename = f"{interface_name}.ts"
        interface_path = os.path.join(frontend_interface_path, interface_filename)
        interface_cache[interface_name] = interface_path

    # Usage example
    interface_cache = {}  # Cache to store interface paths
    frontend_interface_path = os.path.join(current_file_directory, 'path', 'to', 'frontend', 'interfaces')

    # Find interfaces and update cache
    interfaces = find_interfaces(frontend_interface_path)
    for interface_name in interfaces:
        interface_cache[interface_name] = None  # Initialize cache with interface names

    # Synchronize interface paths
    synchronize_interface_paths(interface_cache, frontend_interface_path)

    return generated_files




def mirror_copy(source_dir, dest_dir):
    # Iterate through the source directory
    for root, dirs, files in os.walk(source_dir):
        # Generate corresponding destination directory path
        dest_root = root.replace(source_dir, dest_dir, 1)

        # Create destination directory if it doesn't exist
        if not os.path.exists(dest_root):
            os.makedirs(dest_root)

        # Copy files from source to destination
        for file in files:
            source_file = os.path.join(root, file)
            dest_file = os.path.join(dest_root, file)
            shutil.copy2(source_file, dest_file)  # Copy file metadata along with contents

if __name__ == "__main__":
    # Define source and destination directories
    source_directory = "source_folder"
    destination_directory = "destination_folder"

    # Perform mirror copy
    mirror_copy(source_directory, destination_directory)






