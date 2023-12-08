# binning_numeric_data.py
import pandas as pd


def bin_numeric_data(data, numeric_column, num_bins=5):
    # Group continuous data into bins or intervals
    data[f'{numeric_column}_bin'] = pd.cut(data[numeric_column], bins=num_bins, labels=False)

# Example usage:
# bin_numeric_data(your_data_frame, 'NumericColumn', num_bins=5)
