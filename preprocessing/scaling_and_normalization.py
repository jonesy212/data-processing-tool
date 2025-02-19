# scale_normalize.py
def scale_numeric_columns_task(data, scaling_method='min-max'):
    # Scale or normalize numeric columns using specified method (min-max, z-score, etc.)
    if scaling_method == 'min-max':
        data = (data - data.min()) / (data.max() - data.min())
    elif scaling_method == 'z-score':
        data = (data - data.mean()) / data.std()
    # Add more scaling methods as needed

# Example usage:
# scale_numeric_columns(your_data_frame, scaling_method='min-max')
