
from engineering_features.encode_categorical_data import \
    encode_categorical_data
from remove_duplicates import remove_duplicates

# clean-and-transform-data.py
user_options = {
    'add_missing_indicator': True,
    'impute_missing_values': True,
    'feature_scaling': True,
    'remove_duplicates': False,
    'encode_categorical_data': True,
    'create_interaction_terms': False,
    'apply_log_transformation': True,
    'bin_numeric_data': False,
    'create_custom_feature': True,
    'encode_target_variable': False,
    'polynomial_features': True,
    'scaling_and_normalization': False,
    'extract_time_based_features': True,
    'remove_outliers': False,
    'handle_text_data': True,
    'create_binary_flags': False,
    'bin_categorical_data': True,
    'extract_date_components': False,
    'engineering_features': True,
    'create_task_history': False,
}


def setup_user_options():
    return user_options.copy()

def clean_and_transform_data(data, options):
    # Your cleaning and transformation logic here
    # cleaned_data = data.dropna()
    
    cleaned_data = data.copy()

    # creating a missing value indicator for 'numeric_feature'
    if 'add_missing_indicator' in options and options['add_missing_indicator']:
        cleaned_data['numeric_feature_missing'] = data['numeric_feature'].isnull().astype(int)
        
        
    # imputing mising values with the mean
    #create  a missing value indicator for 'numeric_feature
    data['numeric_feature'] = data['numeric_feature'].isnull().astype(int)
    
    #imputeing missing values with the mean
    if 'impute_missing_values' in options and options['input_missing_values']:
        cleaned_data['numeric_feature'].fillna(data['numeric_feature'].mean(), inplace=True)
        
        
    if 'featuring_scaling' in options and options['feature_scaling']: 
        # Example: Feature scaling
        # Assume 'numeric_feature' is a numeric column in your dataset
        cleaned_data['numeric_feature_scaled'] = (
            cleaned_data['numeric_feature'] - cleaned_data['numeric_feature'].mean()
        ) / cleaned_data['numeric_feature'].std()

    # Encode categorical data
    cleaned_data = encode_categorical_data(cleaned_data, 'YourCategoricalColumn')
    
    # Other transformations based on options
    if 'remove_duplicates' in options and options['remove_duplicates']:
        cleaned_data = remove_duplicates(cleaned_data)

    return cleaned_data


async def process_data_async(data, options):
    return await clean_and_transform_data(data,options)


