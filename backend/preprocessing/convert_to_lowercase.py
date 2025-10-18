def convert_to_lowercase(data, columns):
    for col in columns:
        data[col] = data[col].str.lower()
