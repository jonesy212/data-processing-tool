# extract_date_components.py
def extract_date_components(data, date_column):
    # Extract components like day, month, and year from a date column
    data[f'{date_column}_day'] = data[date_column].dt.day
    data[f'{date_column}_month'] = data[date_column].dt.month
    data[f'{date_column}_year'] = data[date_column].dt.year

# Example usage:
# extract_date_components(your_data_frame, 'DateColumn')
