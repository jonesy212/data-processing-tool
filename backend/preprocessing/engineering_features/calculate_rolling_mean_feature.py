# rolling_mean_feature.py
def calculate_rolling_mean_task(data, numeric_column, window_size=3):
    # Calculate the rolling mean of a numeric column
    data[f'{numeric_column}_rolling_mean'] = data[numeric_column].rolling(window=window_size).mean()

# Example usage:
# calculate_rolling_mean(your_data_frame, 'NumericColumn', window_size=3)
