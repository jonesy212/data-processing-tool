import asyncio

import pandas as pd
from flask import Flask

from authentication.auth import init_login_manager
from database.init_db import init_db
from dataprocessing.data_processing import load_and_process_data
from preprocessing.clean_transformed_data import (clean_and_transform_data,
                                                  process_data_async)
from preprocessing.upload_data import load_data

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///data.db'
init_db(app)
init_login_manager(app)

@app.route('/')
def home():
    return "Welcome to the Flask App"

def create_app():
    from app import login_manager
    login_manager.init_app(app)

    return app 
 
if __name__ == "__main__":
   # Assuming 'your_dataset.csv' is the name of the dataset you want to upload
    dataset_name = 'your_dataset.csv'
    dataset_description = 'Description of your dataset'  # Provide an appropriate description

    # Call the upload_dataset() method to save the dataset
    saved_dataset = load_data(name=dataset_name, description=dataset_description, file=None, url=None)

    # Check if the dataset was successfully saved
    if saved_dataset:
        dataset_path = saved_dataset.file_path  # Use the file_path attribute from the saved dataset
        your_data_frame = pd.read_csv(dataset_path)
        # Further processing or analysis with your_data_frame
        print(f"Dataset {saved_dataset.name} loaded successfully!")
    else:
        print("Failed to save dataset")# clean and transform the data
        transformed_data = clean_and_transform_data(load_and_process_data)  

    # run the data processing asynchronously
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(process_data_async(your_data_frame))

    #Display the transformed data
    print(result)

    #Run the Flask app in debug mode
    create_app().run(debug=True)


