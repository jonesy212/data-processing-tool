# handle_missing_values.py
import pandas as pd


def handle_missing_values_task(data, strategy='mean'):
    # Handle missing values using specified strategy (mean, median, etc.)
    if strategy == 'mean':
        data.fillna(data.mean(), inplace=True)
    elif strategy == 'median':
        data.fillna(data.median(), inplace=True)
    # Add more strategies as needed

# Example usage:
# handle_missing_values(your_data_frame, strategy='mean')