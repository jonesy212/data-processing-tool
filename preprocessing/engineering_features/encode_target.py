# target_encoding.py
def target_encode_task(data, categorical_column, target_column):
    # Target encode categorical variables using mean target value
    target_means = data.groupby(categorical_column)[target_column].mean()
    data[f'{categorical_column}_target_encoded'] = data[categorical_column].map(target_means)

# Example usage:
# target_encode(your_data_frame, 'CategoricalColumn', 'TargetColumn')
