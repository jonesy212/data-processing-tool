# preprocessing_steps.py
import numpy as np
import pandas as pd


def scale_numeric_columns(data, scaling_method='min-max'):
    # Scale or normalize numeric columns using specified method (min-max, z-score, etc.)
    if scaling_method == 'min-max':
        data = (data - data.min()) / (data.max() - data.min())
    elif scaling_method == 'z-score':
        data = (data - data.mean()) / data.std()
    # Add more scaling methods as needed
 
def feature_selection(data, method='correlation_threshold', threshold=0.8):
    # Perform feature selection using specified method (correlation threshold, etc.)
    if method == 'correlation_threshold':
        correlation_matrix = data.corr().abs()
        upper_triangle = correlation_matrix.where(np.triu(np.ones(correlation_matrix.shape), k=1).astype(np.bool))
        to_drop = [column for column in upper_triangle.columns if any(upper_triangle[column] > threshold)]
        data.drop(columns=to_drop, inplace=True)
    # Add more feature selection methods as needed

# Example usage:
# handle_missing_values(your_data_frame, strategy='mean')
# remove_duplicates(your_data_frame)
# scale_numeric_columns(your_data_frame, scaling_method='min-max')
# encode_categorical_variables(your_data_frame, method='one-hot')
# feature_selection(your_data_frame, method='correlation_threshold', threshold=0.8)



