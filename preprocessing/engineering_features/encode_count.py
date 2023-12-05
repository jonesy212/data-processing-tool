def count_encode(data, categorical_column):
    # Count encode categorical variables based on frequency
    count_encoding = data[categorical_column].value_counts()
    data[f'{categorical_column}_count_encoded'] = data[categorical_column].map(count_encoding)

# Example usage:
# count_encode(your_data_frame, 'CategoricalColumn')
