def remove_special_characters(data, columns):
    for col in columns:
        data[col] = data[col].str.replace('[^a-zA-Z0-9]', '', regex=True)
