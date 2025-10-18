import pandas as pd
from scipy.stats import zscore

from dataset.dataset_upload import upload_dataset


def remove_outliers_task(data, columns):
    """
    Remove outliers from specified columns using the Z-score method.

    Parameters:
    - data: pandas DataFrame, the input data
    - columns: list, columns from which outliers should be removed

    Returns:
    - pandas DataFrame, data with outliers removed
    """

    # Copy the data to avoid modifying the original DataFrame
    cleaned_data = data.copy()

    # Loop through specified columns and remove outliers using Z-score
    for column in columns:
        # Calculate the Z-score for each data point in the column
        z_scores = zscore(cleaned_data[column])

        # Define a threshold for Z-score, e.g., 3 standard deviations
        threshold = 3

        # Identify and remove rows with outliers
        outliers = (abs(z_scores) > threshold)
        cleaned_data = cleaned_data[~outliers]

    return cleaned_data

# Example usage:
# Specify the columns from which outliers should be removed
columns_to_remove_outliers = ['NumericColumn1', 'NumericColumn2']

# Load the dataset into your_data_frame
your_data_frame, error_message = upload_dataset()

# Apply the remove_outliers_task function
cleaned_data = remove_outliers_task(your_data_frame, columns_to_remove_outliers)
