import datetime as dt

import pandas as pd


def calculate_age(dob):
    today = dt.date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def feature_engineering_task(data):
    # Create a new "Age" feature using the calculate_age function
    data['Age'] = calculate_age(data['Date of Birth'])
    # Other feature engineering steps can be added as needed
    
    return data

# Example usage:
# your_data_frame = feature_engineering(your_data_frame)