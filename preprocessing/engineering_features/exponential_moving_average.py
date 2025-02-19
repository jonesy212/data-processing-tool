def calculate_exponential_moving_average_task(data, numeric_column, span=3):
    # Calculate the exponential moving average of a numeric column
    data[f'{numeric_column}_ema'] = data[numeric_column].ewm(span=span, adjust=False).mean()

# Example usage:
# calculate_exponential_moving_average(your_data_frame, 'NumericColumn', span=3)
