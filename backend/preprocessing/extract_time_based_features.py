# time_based_features.py
def extract_time_based_features_task(data, timestamp_column):
    # Extract features like day of the week, month, or quarter from timestamp data
    data['Day_of_Week'] = data[timestamp_column].dt.dayofweek
    data['Month'] = data[timestamp_column].dt.month
    data['Quarter'] = data[timestamp_column].dt.quarter

# Example usage:
# extract_time_based_features(your_data_frame, 'Timestamp')
