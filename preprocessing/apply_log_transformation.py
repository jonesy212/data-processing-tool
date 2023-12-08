# # log_transformation.py
import numpy as np


def apply_log_transformation_task(data, numeric_column):
    # Apply log transformation to skewed numeric variables
    data[f'log_{numeric_column}'] = np.log1p(data[numeric_column])

# # Example usage:
# # apply_log_transformation(your_data_frame, 'SkewedNumericColumn')
