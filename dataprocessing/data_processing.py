# data_processing.py
import asyncio
import pandas as pd
from preprocessing.clean_transformed_data import (process_data_async, user_options)
from data_processing import preprocess_text  # Import the preprocess_text function

async def load_and_process_data(dataset_path):
    # Read the dataset into a DataFrame
    your_data_frame = pd.read_csv(dataset_path)
    
    # Preprocess text data if it exists
    if 'text_column' in your_data_frame.columns:  # Assuming 'text_column' is the column containing text data
        your_data_frame['text_column'] = your_data_frame['text_column'].apply(preprocess_text)
    
    # Process the data asynchronously
    transformed_data = await process_data_async(your_data_frame, user_options)
    return transformed_data
