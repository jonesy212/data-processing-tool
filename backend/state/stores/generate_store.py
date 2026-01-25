import json
import os

from jinja2 import Environment, FileSystemLoader
from stores.metadata_extraction import analyze_project


# Function to generate a store file
def generate_store(store_name, components):
    template_path = os.path.join(os.path.dirname(__file__), 'templates', 'store-template.j2')
    
    env = Environment(loader=FileSystemLoader(os.path.dirname(template_path)))
    template = env.get_template(os.path.basename(template_path))
    
    rendered_code = template.render({'storeName': store_name, 'components': components})

    store_file_path = os.path.join(os.path.dirname(__file__), 'src', 'stores', f'{store_name}Store.tsx')
    with open(store_file_path, 'w', encoding='utf-8') as store_file:
        store_file.write(rendered_code)

    print(f'Store {store_name} generated successfully at {store_file_path}')

    analyze_project()

# Function to generate stores based on metadata
def generate_stores(store_metadata):
    for metadata in store_metadata:
        generate_store(metadata['name'], metadata['components'])

# Main function to run the analysis and store generation
def main():
    project_path = os.path.join(os.path.dirname(__file__), 'your_project_path')
    project_metadata = analyze_project(project_path)
    generate_stores(project_metadata)

if __name__ == "__main__":
    main()
