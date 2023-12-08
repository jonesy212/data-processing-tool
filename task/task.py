# task.py
from datetime import datetime

import pandas as pd

from configs.config import db
from data_analysis.analyze_data import analyze_data
from dataset.dataset_upload import save_dataset
from hypothesis_testing.perform_hypothesis_test import perform_hypothesis_test
from models.execution_log import TaskExecutionLog
from models.tasks import DataProcessingTask
from preprocessing.apply_log_transformation import \
    apply_log_transformation_task
from preprocessing.bin_categorical_data import bin_categorical_data
from preprocessing.bin_numeric_data import bin_numeric_data
from preprocessing.clean_transformed_data import clean_and_transform_data
from preprocessing.create_binary_flags import create_binary_flags_task
from preprocessing.engineering_features.time_since_event import \
    time_since_event_task
from script_commands.celery_module import Celery

celery = Celery(__name__, broker='pyamqp://guest:guest@localhost//', backend='rpc://')


def log_task_execution_start(arg1, arg2):
     # Log the start of the task in the TaskExecutionLog
    execution_log = TaskExecutionLog(task_id=None, status='Started', logs=f"Task started with arguments: {arg1}, {arg2}")
    db.session.add(execution_log)
    db.session.commit()
    return execution_log

def log_task_execution_complete(execution_log, arg1, arg2):
    #  Log the successful completion of the task in the TaskExecutionLog
    execution_log.status = 'Completed'
    execution_log.logs += "\nTask completed successfully."
    db.session.commit()
    print(f"Async task executed with arguments: {arg1}, {arg2}")
  
def log_task_execution_error(execution_log, e):
    execution_log.status = 'Error '
    execution_log.message = f"\nError in task execution: {str(e)}"
    # Handle exceptions or errors during the task
    print(f"Error in async task: {str(e)}")
    raise e

def simulate_delay():
    # Simulate a long-running task or asynchronous operation
    import time
    time.sleep(5)  # Simulating a delay of 5 seconds
   
    
@celery.task
def your_async_task(arg1, arg2):
    execution_log = log_task_execution_start(arg1, arg2)
    try:
        # Your asynchronous task logic here
        # Access the database or perform any other asynchronous operation
        data_processing_task = DataProcessingTask.query.get(arg1)
        # Perform data processing logic on the instance
        data_processing_task.perform_data_processing()
        simulate_delay()
        log_task_execution_complete(execution_log, arg1, arg2)
        return f"Task completed successfully for arguments: {arg1}, {arg2}"
    
    except Exception as e:
        log_task_execution_error(execution_log, e)
        
        
        
@celery.task
def perform_data_processing_task(task_id):
    data_processing_task = DataProcessingTask.query.get(task_id)
    if data_processing_task:
        data_processing_task.perform_data_processing()
        
        # Load your dataset or get it from the database
        your_data_frame = load_data

        
        # todo update your_data_frame
        # Calculate the time since the start of data processing and add it as a new feature
        time_since_event_task( your_data_frame, 'EventColumn', 'TimeColumn', 'TimeSinceEvent')

        print(f"Data processing task ({task_id}) completed.")
    else:
        print(f"Data processing task ({task_id}) not found.")







@celery.task
def upload_and_process_data_task(dataset_name, dataset_description, file=None, url=None):
    # Simulate dataset upload and processing
    if file:
        # If file is provided, save it and get the file path
        file_path = save_dataset(file, None, dataset_name, dataset_description)
        data = pd.read_csv(file_path)
    elif url:
        # If URL is provided, read the data from the URL into a DataFrame
        data = pd.read_csv(url)
        # Save the dataset with URL (assuming it is a valid URL)
        save_dataset(None, url, dataset_name, dataset_description)
    else:
        # Handle the case where neither file nor URL is provided
        print("Error: Please provide either a file or a URL for dataset upload.")
        return

    # Further processing logic can be added here
    # For example, you might want to perform some analysis or transformations on the data

    # Print a message indicating the dataset is uploaded and processed
    print(f"Dataset {dataset_name} uploaded and processed.")

    # Return the processed data or any relevant information
    return data




@celery.task
def clean_data_task(data, options):
    
    if data.empty:
        print("Error: Empty DataFrame provided for cleaning.")
        return None
    
    valid_options = {'add_missing_indicator', 'impute_missing_values', 'feature_scaling', 'remove_duplicates'}
    if not set(options.keys()).issubset(valid_options):
        print("Error: Invalid options provided for cleaning.")
        return data
    # Task to clean the data
    
    if not isinstance(data,pd.DataFrame):
        print("Error: Invalid data type. Expected a pandas DataFrame.")
        return data
    
    # Further processing if needed
    cleaned_data = clean_and_transform_data(data, options)
    if len(cleaned_data) == 0:
        print("What you provided is empty.  Please provide data to be cleaned.")
    print("Data cleaning task completed.")
    return cleaned_data





@celery.task
def analyze_data_task(data):
    # Task to analyze the data
    
    if data.empty:
        print("Error: Empty DataFrame provided for cleaning.")
        return None
    
    valid_data_types = {pd.DataFrame}
    if not isinstance(data, valid_data_types):
        print(f"Error: Invalid data type. Expected one of {valid_data_types}.")
        return None
    
    
    unexpected_values = ['NaN', 'inf', '-inf']
    if data.isin(unexpected_values).any().any():
        print(f"Error: Unexpected values {unexpected_values} found in the provided data.")
        return None
    
    
    analysis_results = analyze_data(data)    

    required_columns = {'numeric_feature'}
    if not required_columns.issubset(data.columns):
        print(f"Error: Required columns {required_columns} not found in the provided data.")
        return data

    if not isinstance(data, pd.DataFrame):
        print("Error: Unexpected data type. Expected a pandas DataFrame.")
        return data

    if analysis_results is None:
        print("We have no analysis information.  Please upload data analysis information to process your request.")
    print("Data analysis task completed.")
    # return the analysis results
    return analysis_results

@celery.task
def hypothesis_test_task(data, test_type):
    # Task to perform hypothesis tests
    hypothesis_test_results = analyze_data(data, test_type) 
    # Further processing if needed
    
    if hypothesis_test_results is None:
        print(f" Hypothesis test ({test_type}) results are empty.  ")
        
    supported_test_types = ['t-test', 'chi-squred', 'z-test']
    if test_type not in supported_test_types:
        print(f"Error: Hypothesis test type ({test_type}) is not supported.")
        #Handle the error case appropritately, such as raising an exception or logging.
    print(f"Hypothesis test ({test_type}) task completed.")
    return hypothesis_test_results

@celery.task
def impute_numbers_task(data, imputation_method):
    # Task to impute numbers based on the type of test
    impute_numbers_results = analyze_data(data, imputation_method)
    # Further processing if needed
    if impute_numbers_results is None:
        print(f"Warning: Number imputation ({imputation_method} resutlts are empty)")
        
    # Simulate a case where an unsupported imputation method is provided
    supported_imputation_methods = ['mean', 'median', 'knn']
    if imputation_method not in supported_imputation_methods:
        print(f"Error: Number imputation method ({imputation_method} is not supported.)")
    print(f"Number imputation task ({imputation_method}) completed.")
    # return the number of imputes
    return impute_numbers_results
    
# Command to apply log transformation
@celery.task
def command_apply_log_transformation(data, numeric_column):
    apply_log_transformation_task(data, numeric_column)

# Command to bin categorical data
@celery.task
def command_bin_categorical_data(data, categorical_column):
    bin_categorical_data(data, categorical_column)

# Command to bin numeric data
@celery.task
def command_bin_numeric_data(data, numeric_column, num_bins=5):
    bin_numeric_data(data, numeric_column, num_bins=num_bins)

# Command to create binary flags
@celery.task
def command_create_binary_flags(data, categorical_columns):
    create_binary_flags_task(data, categorical_columns)
    
    