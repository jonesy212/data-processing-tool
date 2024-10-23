import pathlib

from jinja2 import Environment, FileSystemLoader
from metadata_extraction import extract_metadata
from template_engine import generate_file_from_template

from logging_system.log_todos import TodoLogger

todo_logger = TodoLogger()

class TemplateRenderer:
    def __init__(self):
        self.todo_logger = TodoLogger()

    def render_template(self, template_path, output_path, data):
        generate_file_from_template(template_path, output_path, data)


# Custom exception for missing stores
# Custom exception for missing stores
class MissingStoreError(Exception):
    def __init__(self, store_name, folder_name, original_error):
        super().__init__(f"Error generating store '{store_name}' from folder '{folder_name}': {original_error}")
        self.store_name = store_name
        self.folder_name = folder_name
        self.original_error = original_error


# Function to generate a MobX state store
def generate_mobx_store(store_name: str, components: list[str]):
    try:
        template_path = pathlib.path.join(pathlib.path.dirname(__file__), 'templates', 'mobx-store-template.j2')
        output_path = pathlib.path.join(pathlib.path.dirname(__file__), 'output', f'{store_name}Store.js')

        env = Environment(loader=FileSystemLoader(pathlib.path.dirname(template_path)))
        template = env.get_template(pathlib.path.basename(template_path))

        data = {'storeName': store_name, 'components': components}
        rendered_code = template.render(data)

        generate_file_from_template(template_path, output_path, data)

    except Exception as e:
        raise MissingStoreError(store_name, pathlib.path.basename(pathlib.path.dirname(template_path)), str(e))


# Function to create a store file for a model
def create_store_file(model_class, store_path):
    # Extract model name from the class
    model_name = model_class.__name__

    # Components can be derived based on your project structure or other logic
    components = [f'{model_name}Store']

    # Generate the MobX store
    generate_mobx_store(model_name, components)


# Main function for code generation testing
def main_generator():
    # Example metadata
    desired_store_metadata = [
        {'name': 'BrowserCompatibility', 'components': ['BrowserCheckStore']},
        {'name': 'User', 'components': ['UserStore']},
        {'name': 'ProcessingLogs', 'components': ['ProcessingLogsStore']},
        {'name': 'Project', 'components': ['ProjectStore']},
        {'name': 'Task', 'components': ['TaskStore']},
        {'name': 'DataProcessingTask', 'components': ['DataProcessingTaskStore']},  # Updated entry for the new 'DataProcessingTask'
        {'name': 'Team', 'components': ['TeamStore']},
        {'name': 'Dataset', 'components': ['DatasetStore']},
        {'name': 'ExecutionLog', 'components': ['ExecutionLogStore']},
        # Add more metadata entries as needed
    ]

    # Extracted store metadata
    metadata = extract_metadata('/path/to/code/directory')  # Update with your actual path

    # Existing store generators
    existing_store_generators = set(metadata_entry['name'] for metadata_entry in metadata)

    for metadata_entry in desired_store_metadata:
        store_name = metadata_entry['name']
        components = metadata_entry['components']

        if store_name not in existing_store_generators:
            try:
                # If the store is missing, generate it
                generate_mobx_store(store_name, components)
                print(f"Generated missing store: {store_name}")
            except MissingStoreError as e:
                # Log the details of the missing store
                print(f"Error: {e}")
                todo_logger.log(f"Error: {e}")

if __name__ == "__main__":
    main_generator()
