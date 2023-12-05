# text_length_feature.py
def text_length_feature(data, text_column):
    # Create a new feature representing the length of text in a column
    data[f'{text_column}_length'] = data[text_column].apply(len)

# Example usage:
# text_length_feature(your_data_frame, 'TextColumn')
