import ast
import os
from collections import defaultdict


def generate_backend_structure(directory):
    backend_structure = defaultdict(dict)

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                parse_file(file_path, backend_structure)

    return backend_structure

def parse_file(file_path, backend_structure):
    with open(file_path, 'r') as f:
        try:
            tree = ast.parse(f.read(), filename=file_path)
            process_ast(tree, backend_structure)
        except SyntaxError:
            print(f"SyntaxError in file: {file_path}")

def process_ast(node, backend_structure):
    for item in node.body:
        if isinstance(item, ast.ClassDef):
            class_name = item.name
            backend_structure[class_name]['file'] = file_path
            backend_structure[class_name]['methods'] = [method.name for method in item.body if isinstance(method, ast.FunctionDef)]

# Replace 'path/to/your/codebase' with the actual path to your Python codebase
codebase_path = 'path/to/your/codebase'
result = generate_backend_structure(codebase_path)

# Print or save 'result' as needed
