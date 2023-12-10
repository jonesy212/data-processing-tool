import pandas as pd


# encode_categorical_data.py
def encode_categorical_data(data, categorical_column):
    # Check if the provided column exists in the DataFrame
    if categorical_column not in data.columns:
        print(f"Error: Column '{categorical_column}' not found in the provided data.")
        return

    # Check if the 'encode_categorical_data' option is set to True
    if 'encode_categorical_data' in options and options['encode_categorical_data']:
        # Your encoding logic here
        data_encoded = pd.get_dummies(data, columns=[categorical_column], prefix=categorical_column, drop_first=True)
        return data_encoded
    else:
        return data
