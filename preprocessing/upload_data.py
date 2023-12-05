# load_data.py
import pandas as pd


def load_data(file_path):
    # Load data into a pandas DataFrame
    data = pd.read_csv(file_path)  # Assuming a CSV file; adjust accordingly
    return data

# Example usage:
# your_data_frame = load_data('your_dataset.csv')
