
# data_preview.py
import os

import pandas as pd
from flask import session

from preprocessing.clean_transformed_data import (process_data_async,
                                                  user_options)
from preprocessing.memory_reduction import reduce_memory_usage


def preview_dataset(file_path, num_rows=5):
    #determine the file format based on the extension
    file_format = os.path.splitext(file_path)[1].lower()

    # load the dataset based on the file format
    try:
        if file_format == 'csv':
            data = pd.read_csv(file_path)
        elif file_format in ["xls", "xlsx"]:
            data = pd.read_excel(file_path)
        elif file_format == "json":
            data = pd.read_json(file_path)
        else:
            return f"Unsupported file format: {file_format}"

    except FileNotFoundError:
        return "File not found. Pleae provide a valid file path."
    
    
    #Preview the first 'num_rows' rows of the dataset
    preview = data.head(num_rows)
    
    return preview






def preview_and_process_dataset(file_path, num_rows=5):
    file_format = os.path.splitext(file_path)[1].lower()

    try:
        if file_format == 'csv':
            data = pd.read_csv(file_path)
        elif file_format in ["xls", "xlsx"]:
            data = pd.read_excel(file_path)
        elif file_format == "json":
            data = pd.read_json(file_path)
        else:
            return f"Unsupported file format: {file_format}"

    except FileNotFoundError:
        return "File not found. Please provide a valid file path."

    # Reduce memory usage dynamically
    data = reduce_memory_usage(data, verbose=True)

    # Preview the first 'num_rows' rows of the dataset
    preview = data.head(num_rows)

    # Process the data asynchronously
    transformed_data = process_data_async(data, user_options)

    return preview, transformed_data

# Example usage:
# Replace 'your_dataset.csv' with the actual path to your dataset file
file_path = session.get('file_path')
preview_result = preview_dataset(file_path)

# Display the preview result
print(preview_result)



# Example usage:
# Replace 'your_dataset.csv' with the actual path to your dataset file
file_path = session.get('file_path')
preview_result = preview_dataset(file_path)

# Display the preview result
print(preview_result)