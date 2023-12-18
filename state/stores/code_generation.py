import os

from jinja2 import Environment, FileSystemLoader
from template_engine import generate_file_from_template


# Function to generate a MobX state store
def generate_mobx_store(store_name, components):
    try:
        template_path = os.path.join(os.path.dirname(__file__), 'templates', 'mobx-store-template.j2')
        output_path = os.path.join(os.path.dirname(__file__), 'output', f'{store_name}Store.js')

        env = Environment(loader=FileSystemLoader(os.path.dirname(template_path)))
        template = env.get_template(os.path.basename(template_path))

        data = {'storeName': store_name, 'components': components}
        rendered_code = template.render(data)

        generate_file_from_template(template_path, output_path, data)

    except Exception as e:
        print(f"Error generating MobX store: {str(e)}")



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
    store_metadata = [
        {'name': 'BrowserCompatibility', 'components': ['BrowserCompatibilityStore']},
        {'name': 'User', 'components': ['UserStore']},
        {'name': 'ProcessingLogs', 'components': ['ProcessingLogsStore']},
        {'name': 'Project', 'components': ['ProjectStore']},
        {'name': 'Task', 'components': ['TaskStore']},
        {'name': 'Tasks', 'components': ['TasksStore']},
        {'name': 'Team', 'components': ['TeamStore']},
        {'name': 'Dataset', 'components': ['DatasetStore']},
        {'name': 'ExecutionLog', 'components': ['ExecutionLogStore']},
        # Add more metadata entries as needed
    ]

    for metadata in store_metadata:
        generate_mobx_store(metadata['name'], metadata['components'])

if __name__ == "__main__":
    main_generator()
