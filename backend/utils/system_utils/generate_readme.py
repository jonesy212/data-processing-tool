import os


def generate_readme(directory):
    readme_content = """# Data Processing Tool

This Python backend serves as a data processing tool for conducting data analysis. The application is structured with various modules and components to handle tasks related to data analysis, dataset processing, hypothesis testing, and more.

## Project Structure

- **app.py**: Main entry point for the application.
"""

    for root, dirs, files in os.walk(directory):
        if "__pycache__" in dirs:
            dirs.remove("__pycache__")  # Exclude __pycache__ directory
        relative_path = os.path.relpath(root, directory)
        if relative_path == ".":
            relative_path = ""

        for file in files:
            if file == "requirements.txt":
                dependencies = get_dependencies(os.path.join(root, file))
                readme_content += f"\n## Dependencies\n\n```plaintext\n{dependencies}\n```\n"

    readme_path = os.path.join(directory, "README.md")
    with open(readme_path, "w") as readme_file:
        readme_file.write(readme_content)

def get_dependencies(requirements_file):
    with open(requirements_file, "r") as file:
        dependencies = file.read()
    return dependencies

if __name__ == "__main__":
    # Assuming your script is one folder deep in the project
    script_directory = os.path.dirname(__file__)
    project_root = os.path.dirname(script_directory)
    generate_readme(project_root)
    print("Project Root:", project_root)
