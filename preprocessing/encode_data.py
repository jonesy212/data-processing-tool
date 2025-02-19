# encode_data.py
import pandas as pd


def encode_categorical_variables_task(data, method='one-hot'):
    # Encode categorical variables using specified method (one-hot encoding, label encoding, etc.)
    if method == 'one-hot':
        data = pd.get_dummies(data, columns=data.select_dtypes(include='object').columns)
    elif method == 'label':
        # Implement label encoding
        pass
    # Add more encoding methods as needed

# Example usage:
# encode_categorical_variables(your_data_frame, method='one-hot')
