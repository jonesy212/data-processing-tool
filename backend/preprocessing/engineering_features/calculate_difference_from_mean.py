def calculate_difference_from_mean_task(data, numeric_column):
    # Calculate the difference of each value from the mean of a numeric column
    data[f'{numeric_column}_diff_from_mean'] = data[numeric_column] - data[numeric_column].mean()

# Example usage:
# calculate_difference_from_mean(your_data_frame, 'NumericColumn')
