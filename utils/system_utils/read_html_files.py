import os

from flask import render_template


def read_html_files(file_paths):
    """
    Read HTML content from a list of file paths.
    Args:
        file_paths (list): List of file paths.

    Returns:
        str: Accumulated HTML content.
    """
    html_content = ''
    for file_path in file_paths:
        try:
            with open(file_path, 'r') as file:
                html_content += file.read()
        except FileNotFoundError:
            print(f"Warning: File not found at {file_path}")
        except Exception as e:
            print(f"Error reading file at {file_path}: {e}")
    
    return html_content

# Assuming generated_html_files is a list of HTML file paths
generated_html_files = ['/path/to/file1.html', '/path/to/file2.html', '/path/to/file3.html']

# Using the read_html_files function to accumulate HTML content
login_form_html = read_html_files(generated_html_files)

# Render the template with the accumulated HTML content
return render_template('Login.tsx', login_form_html=login_form_html)
