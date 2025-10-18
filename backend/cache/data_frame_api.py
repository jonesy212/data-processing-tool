# backend/data_frame_api.py
import pandas as pd
from flask import json


class DataFrameAPI:
    def __init__(self, initial_data=None):
        self.data_frame = pd.DataFrame(initial_data)

    def get_data_frame(self):
        return self.data_frame

    def set_data(self, data):
        self.data_frame = pd.DataFrame(data)

    def append_data(self, data):
        self.data_frame = pd.concat([self.data_frame, pd.DataFrame(data)], ignore_index=True)

    def update_data_frame(self):
        self.data_frame = pd.DataFrame(self.data_frame.to_dict(orient="records"))

    def add_rows(self, new_rows):
        self.data_frame = pd.concat([self.data_frame, pd.DataFrame(new_rows)], ignore_index=True)

    def remove_rows(self, updated_rows):
        updated_rows_json = [json.dumps(row, sort_keys=True) for row in updated_rows]
        self.data_frame = self.data_frame[~self.data_frame.apply(lambda row: json.dumps(row, sort_keys=True) in updated_rows_json, axis=1)]

    def update_data(self, updated_data):
        for new_item in updated_data:
            item_id = new_item.get('id')
            if item_id is not None:
                index = self.data_frame[self.data_frame['id'] == item_id].index
                if not index.empty:
                    self.data_frame.loc[index] = new_item
                else:
                    print(f"Item with id {item_id} not found in the DataFrame.")
            else:
                print("Item does not have an 'id' property.")
                
# Create a single instance of DataFrameAPI
data_frame_api = DataFrameAPI()
