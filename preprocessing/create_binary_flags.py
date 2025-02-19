import pandas as pd


# create_binary_flags.py
def create_binary_flags_task(data, categorical_columns):
    # Convert categorical variables into binary flags (0 or 1)
    for column in categorical_columns:
        data[f'{column}_flag'] = data[column].apply(lambda x: 1 if pd.notnull(x) else 0)

# Example usage:
# create_binary_flags(your_data_frame, ['Category1', 'Category2'])
