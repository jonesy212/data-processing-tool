def remove_white_spaces(data, columns):
    for col in columns:
        data[col] = data[col].str.strip()