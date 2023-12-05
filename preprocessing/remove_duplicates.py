# remove_duplicates.py
def remove_duplicates(data):
    # Remove duplicate rows from the dataset
    data.drop_duplicates(inplace=True)

# Example usage:
# remove_duplicates(your_data_frame)
