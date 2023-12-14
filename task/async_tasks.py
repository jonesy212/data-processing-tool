# async_tasks.py
import asyncio

from preprocessing.apply_log_transformation import \
    apply_log_transformation_task
from preprocessing.create_binary_flags import create_binary_flags_task
from preprocessing.create_interaction_terms import \
    create_interaction_terms_task
from preprocessing.encode_data import encode_categorical_variables_task
from preprocessing.engineering_features.calculate_cumulative_sum import \
    calculate_cumulative_sum_task
from preprocessing.engineering_features.calculate_difference_from_mean import \
    calculate_difference_from_mean_task
from preprocessing.engineering_features.calculate_rolling_mean_feature import \
    calculate_rolling_mean_task
from preprocessing.engineering_features.create_custom_feature import \
    create_custom_feature_task
from preprocessing.engineering_features.encode_count import count_encode_task
from preprocessing.engineering_features.encode_ordinal_data import \
    encode_ordinal_data_task
from preprocessing.engineering_features.encode_target import target_encode_task
from preprocessing.engineering_features.exponential_moving_average import \
    calculate_exponential_moving_average_task
from preprocessing.extract_time_based_features import \
    extract_time_based_features_task
from preprocessing.feature_engineering import feature_engineering_task
from preprocessing.handle_missing_values import handle_missing_values_task
from preprocessing.polynomial_features import generate_polynomial_features_task
from preprocessing.scaling_and_normalization import scale_numeric_columns_task
from task.task import (analyze_data_task, calculate_difference_from_mean_task,
                       calculate_rolling_mean_task, clean_data_task,
                       count_encode_task, create_custom_feature_task,
                       hypothesis_test_task, impute_numbers_task,
                       upload_and_process_data_task, your_async_task)


def async_your_async_task(arg1, arg2):
    your_async_task.apply_async(args=[arg1, arg2])
    
    
def async_upload_and_process_data(dataset_name, dataset_description, file=None, url=None):
    upload_and_process_data_task.apply_async(args=[dataset_name, dataset_description, file, url])

def async_clean_and_transform_data(data, options):
    clean_data_task.apply_async(args=[data, options])

def async_clean_data(data, options):
    clean_data_task.apply_async(args=[data, options])

def async_analyze_data(data):
    analyze_data_task.apply_async(args=[data])

def async_hypothesis_test_(data, test_type):
    hypothesis_test_task.apply_async(args=[data, test_type])

def async_impute_numbers_task(data, imputation_method):
    impute_numbers_task.apply_async(args=[data, imputation_method])

def async_apply_log_transformation_task(data, numeric_column):
    apply_log_transformation_task.apply_async(args=[data, numeric_column])

def async_create_interaction_terms_task(data, interaction_columns):
    create_interaction_terms_task.apply_async(args=[data, interaction_columns])


def async_create_binary_flags(data, categorical_columns):
    create_binary_flags_task.apply_async(args=[data, categorical_columns])


def async_encode_data(data, encoding_columns):
    encode_categorical_variables_task.apply_async(args=[data, encoding_columns])


def async_feature_engineering(data, feature_functions):
    feature_engineering_task.apply_async(args=[data, feature_functions])


def async_scaling_and_normalization(data, numeric_columns):
    scale_numeric_columns_task.apply_async(args=[data, numeric_columns])


def async_handle_missing_values(data, strategy='mean'):
    handle_missing_values_task.apply_async(args=[data, strategy])


def async_polynomial_features(data, degree=2):
    generate_polynomial_features_task.apply_async(args=[data, degree])


def async_extract_time_based_features(data, time_column):
    extract_time_based_features_task.apply_async(args=[data, time_column])
    
    
def async_calculate_cumulative_sum(data, columns):
    calculate_cumulative_sum_task.apply_async(args=[data, columns])


def async_calculate_difference_from_mean(data, columns):
    calculate_difference_from_mean_task.apply_async(args=[data, columns])


def async_calculate_rolling_mean(data, columns, window_size):
    calculate_rolling_mean_task.apply_async(args=[data, columns, window_size])


def async_create_custom_feature(data, feature_expression, new_feature_name):
    create_custom_feature_task.apply_async(args=[data, feature_expression, new_feature_name])

def async_count_encode(data, columns):
    count_encode_task.apply_async(args=[data, columns])

def async_encode_ordinal_data(data, columns, order_mapping):
    encode_ordinal_data_task.apply_async(args=[data, columns, order_mapping])

def async_target_encode(data, target_column, columns):
    target_encode_task.apply_async(args=[data, target_column, columns])

def async_calculate_exponential_moving_average(data, columns, alpha):
    calculate_exponential_moving_average_task.apply_async(args=[data, columns, alpha])

def async_time_since_event(data, event_column, time_column, new_feature_name):
    create_custom_feature_task.apply_async(args=[data, event_column, time_column, new_feature_name])



# Async version of time_since_event_task
async def async_time_since_event_task(data, event_column, time_column, new_feature_name):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, async_time_since_event_task, data, event_column, time_column, new_feature_name)

# Async command for time_since_event_task
def async_time_since_event(data, event_column, time_column, new_feature_name):
    async_time_since_event_task.apply_async(args=[data, event_column, time_column, new_feature_name])
