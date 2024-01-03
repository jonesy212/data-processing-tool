# data_processing.py
import asyncio

import pandas as pd

from preprocessing.clean_transformed_data import (process_data_async,
                                                  user_options)


async def load_and_process_data(dataset_path):
    your_data_frame = pd.read_csv(dataset_path)
    transformed_data = await process_data_async(your_data_frame, user_options)
    return transformed_data