# encoding_ordinal_data.py
def encode_ordinal_data_task(data, ordinal_column, mapping_dict):
    # Encode ordinal data using a predefined mapping
    data[f'{ordinal_column}_encoded'] = data[ordinal_column].map(mapping_dict)

# Example usage:
# mapping_dict = {'Low': 1, 'Medium': 2, 'High': 3}
# encode_ordinal_data(your_data_frame, 'OrdinalColumn', mapping_dict)
