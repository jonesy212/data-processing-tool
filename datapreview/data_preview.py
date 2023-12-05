# data_preview.py
import pandas as pd


def preview_dataset(file_path, num_rows=5):
    #determine the file format based on the extension
    file_format = file_path.rsplit('.', 1)[-1].lower()
    
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

# Example usage:
# Replace 'your_dataset.csv' with the actual path to your dataset file
file_path = 'your_dataset.csv'
preview_result = preview_dataset(file_path)

# Display the preview result
print(preview_result)