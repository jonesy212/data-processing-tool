# metadata_extraction.py
import json
import os

from state_error_handling.error_handling import handle_errors
from template_engine import generate_file_from_template


# Function to analyze project structure and extract metadata
def analyze_project(project_path):
    store_metadata = []

    for root, dirs, files in os.walk(project_path):
        for file in files:
            if file.endswith('.tsx'):
                folder_name = os.path.basename(root)
                store_name = ''.join(word.capitalize() for word in folder_name.split('_'))
                components = [file.replace('.tsx', '')]
                store_metadata.append({'name': store_name, 'components': components})

    return store_metadata



# Function to extract metadata from the project structure
def extract_metadata(src_path):
    metadata = []
    try:
        # Add logic to analyze the project structure and extract metadata
        metadata = analyze_project(src_path)

        # Serialize metadata to a JSON-like format (you can customize this)
        metadata_json = json.dumps(metadata, indent=2)
        print("Extracted Metadata:")
        print(metadata_json)
       
    except Exception as e:
        handle_errors('metadata_extraction', 'extraction_error', str(e))

    return metadata

# Function to generate a metadata file
def generate_metadata_file(metadata, output_path):
    try:
        template_path = os.path.join(os.path.dirname(__file__), 'templates', 'metadata-template.ejs')

        data = {'metadata': metadata}
        generate_file_from_template(template_path, output_path, data)
    except Exception as e:
        print(f"Error generating metadata file: {str(e)}")

# Main function for metadata extraction and generation
def main():
    src_path = os.path.join(os.path.dirname(__file__), 'src')
    
    # Get all files with .js or .tsx extensions
    js_and_tsx_files = [file for file in os.listdir(src_path) if file.endswith(('.js', '.tsx'))]

    metadata_output_path_js = os.path.join(os.path.dirname(__file__), 'output', 'metadata.js')
    metadata_output_path_tsx = os.path.join(os.path.dirname(__file__), 'output', 'metadata.tsx')

    # Extract metadata
    metadata = extract_metadata(src_path)

    # Generate metadata file with .js extension
    generate_metadata_file(metadata, metadata_output_path_js)

    # Generate metadata file with .tsx extension
    generate_metadata_file(metadata, metadata_output_path_tsx)

if __name__ == "__main__":
    main()