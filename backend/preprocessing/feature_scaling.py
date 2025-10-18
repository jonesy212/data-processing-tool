# feature_scaling.py
from sklearn.preprocessing import MinMaxScaler


def scale_features(data, numeric_columns):
    # Scale numeric features to a specified range (e.g., [0, 1])
    scaler = MinMaxScaler()
    data[numeric_columns] = scaler.fit_transform(data[numeric_columns])

# Example usage:
# scale_features(your_data_frame, ['NumericColumn1', 'NumericColumn2'])
