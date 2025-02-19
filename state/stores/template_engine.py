import logging  # Import the logging module from log_config
import os

from jinja2 import Environment, FileSystemLoader

# Set up logging configuration
from logging_system.logger_config import setup_logging

setup_logging()  # Initialize the logging configuration

logger = logging.getLogger(__name__)

# Function to load and render a template
def render_template(template_path, data):
    """
    Render a template with the provided data.

    Parameters:
    - template_path (str): Path to the template file.
    - data (dict): Data to be used for rendering the template.

    Returns:
    - str or None: Rendered content if successful, None if an error occurs.
    """
    try:
        env = Environment(loader=FileSystemLoader(os.path.dirname(template_path)))
        template = env.get_template(os.path.basename(template_path))

        rendered_content = template.render(data)
        return rendered_content
    except Exception as e:
        logger.error("Error rendering template: %s", str(e))
        return None

# Function to generate a file from a template
def generate_file_from_template(template_path, output_path, data):
    """
    Generate a file by rendering a template with the provided data.

    Parameters:
    - template_path (str): Path to the template file.
    - output_path (str): Path to the output file.
    - data (dict): Data to be used for rendering the template.

    """
    try:
        rendered_content = render_template(template_path, data)

        if rendered_content:
            with open(output_path, 'w', encoding='utf-8') as output_file:
                output_file.write(rendered_content)
                logger.info("File generated successfully at %s", output_path)
    except Exception as e:
        logger.error("Error generating file: %s", str(e))

# Main function for template engine testing
def main():
    template_path = os.path.join(os.path.dirname(__file__), 'templates', 'example-template.j2')
    output_path = os.path.join(os.path.dirname(__file__), 'output', 'example-output.txt')
    data = {'name': 'John Doe', 'age': 30}

    generate_file_from_template(template_path, output_path, data)

if __name__ == "__main__":
    main()
