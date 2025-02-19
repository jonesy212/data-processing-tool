import pandas as pd


# binning_categorical_data.py
def bin_categorical_data(data, categorical_column):
    # Group categorical data into bins or intervals based on frequency
    data[f'{categorical_column}_bin'] = pd.qcut(data[categorical_column].rank(method='first'), q=5, labels=False)

# Example usage:
# bin_categorical_data(your_data_frame, 'CategoricalColumn')
