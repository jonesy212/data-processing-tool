# cumulative_sum_feature.py
def calculate_cumulative_sum_task(data, numeric_column):
    # Calculate the cumulative sum of a numeric column
    data[f'{numeric_column}_cumulative_sum'] = data[numeric_column].cumsum()

# Example usage:
# calculate_cumulative_sum(your_data_frame, 'NumericColumn')
