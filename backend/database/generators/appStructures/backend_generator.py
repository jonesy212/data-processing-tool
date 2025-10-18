import ast
import os
from collections import defaultdict


def generate_frontend_structure(directory):
    frontend_structure = defaultdict(dict)

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts'):
                file_path = os.path.join(root, file)
                parse_file(file_path, frontend_structure)

    return frontend_structure

def parse_file(file_path, frontend_structure):
    with open(file_path, 'r') as f:
        try:
            tree = ast.parse(f.read(), filename=file_path)
            process_ast(tree, frontend_structure)
        except SyntaxError:
            print(f"SyntaxError in file: {file_path}")

def process_ast(node, frontend_structure):
    for item in node.body:
        if isinstance(item, ast.ClassDef):
            class_name = item.name
            frontend_structure[class_name]['file'] = file_path
            frontend_structure[class_name]['methods'] = [method.name for method in item.body if isinstance(method, ast.FunctionDef)]

# Replace 'path/to/your/codebase' with the actual path to your codebase
codebase_path = 'path/to/your/codebase'
result = generate_frontend_structure(codebase_path)

# Print or save 'result' as needed
