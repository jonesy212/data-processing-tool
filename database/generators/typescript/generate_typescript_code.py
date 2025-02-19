import argparse
import asyncio
import os
import subprocess

import run_draft

from database.generators.typescript.generate_and_insert_fake_data_for_models import \
    generate_and_insert_fake_data_for_models
from utils.find_models import find_models

frontendInterfacePath = "/path/to/frontend/interfaces"




def execute_command(command):
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    return process.returncode, stdout, stderr

def generate_typescript_code(models, fake_data, dry_run=False):
    generated_files = []

    for model_class in models:
        # Check if the interface file exists
        interface_path = f"{frontendInterfacePath}/{model_class.__name__}.ts"

        if not os.path.exists(interface_path):
            # Generate the interface code
            interface_code = generate_interface_code(model_class)

            # Save the interface code to the file
            with open(interface_path, 'w') as file:
                file.write(interface_code)

        # Generate the store code
        store_code = generate_store_code(model_class, fake_data[model_class])

        # Define the file path for the store code
        file_path = f"path/to/generate/{model_class.__name__}Store.ts"
        generated_files.append(file_path)

        if not dry_run:
            # If not a dry run, actually write the TypeScript code to the file
            with open(file_path, 'w') as file:
                file.write(store_code)

    return generated_files


def generate_interface_code(model_class):
    # Generate the interface code here
    interface_code = f"export interface {model_class.__name__} {{\n"
    for column in model_class.__table__.columns:
        interface_code += f"  {column.name}: {get_typescript_type(column.type)};\n"
    interface_code += "}"
    return interface_code




def generate_store_code(model_class, instances):
    # Generate the store code here
    store_code = f"class {model_class.__name__}Store {{\n"
    for instance in instances:
        store_code += "  "
        for column in model_class.__table__.columns:
            store_code += f"{column.name}: {type(instance.__getattribute__(column.name)).__name__}; "
        store_code += "\n"
    store_code += "}\n\n"
    return store_code
def execute_typescript_generation_script(typescript_files, typescript_code, dry_run=False):
    if dry_run:
        print("=== DRY RUN ===")
        print("Generated Files:")
        for file_path in typescript_code:
            print(file_path)
        print("================")
    else:
        # Execute the actual script or save the code to TypeScript files
        # ...
        print("Executing TypeScript generation script...")

        # Placeholder: Modify this part based on your actual script execution logic
        # Example: Running a command to transpile TypeScript files
        command = "tsc " + " ".join(typescript_files)
        return_code, stdout, stderr = execute_command(command)

        if return_code == 0:
            print("TypeScript generation successful!")
        else:
            print("Error during TypeScript generation:")
            print(stderr.decode())



def get_typescript_type(sqlalchemy_type):
    sqlalchemy_type = str(sqlalchemy_type).lower()

    if 'integer' in sqlalchemy_type:
        return 'number'
    elif 'float' in sqlalchemy_type or 'numeric' in sqlalchemy_type:
        return 'number'
    elif 'string' in sqlalchemy_type:
        return 'string'
    elif 'text' in sqlalchemy_type:
        return 'string'
    elif 'date' in sqlalchemy_type:
        return 'Date'
    elif 'bool' in sqlalchemy_type:
        return 'boolean'
    else:
        return 'any'



# Handle errors from transpilation
async def main():
    parser = argparse.ArgumentParser(description="Generate TypeScript code for models.")
    parser.add_argument('--try-it', action='store_true', help='Perform try-it as a dry-run without actually creating files.')

    args = parser.parse_args()
       # Perform a dry run
    await run_draft(dry_run=True)

    # Call your function with the dry run parameter based on the command-line argument
    generate_typescript_code(models, fake_data, dry_run=args.dry_run)
    
if __name__ == '__main__':
    asyncio.run(main())

# Your existing script
models = find_models()
fake_data = generate_and_insert_fake_data_for_models(models)

# Test Run (Dry Run)
generated_files = generate_typescript_code(models, fake_data, dry_run=True)

# If satisfied with the test run, execute the actual generation
execute_typescript_generation_script(generated_files, dry_run=False)
