# data_analysis.py
import pandas as pd


def analyze_data(data, filters=None):
    """
    Analyze the dataset and return summary statistics.

    Parameters:
    - data: DataFrame, the dataset for analysis
    - filters: dict, user-defined filters for data

    Returns:
    - analysis_results: dict, summary statistics
    """
    
    analysis_results = {}

    try:
        # Check if the provided data is a DataFrame
        if not isinstance(data, pd.DataFrame):
            raise ValueError("Input data must be a DataFrame.")

        # Example: Calculate mean, median, standard deviation, etc.
        summary_stats = data.describe()

        # Example: Calculate correlation matrix
        correlation_matrix = data.corr()

        # Additional statistical measures
        mean_values = data.mean()
        median_values = data.median()
        std_deviation = data.std()
        skewness = data.skew()
        kurtosis = data.kurt()

        # Add additional measures to the summary statistics
        summary_stats['mean'] = mean_values
        summary_stats['median'] = median_values
        summary_stats['std_deviation'] = std_deviation
        summary_stats['skewness'] = skewness
        summary_stats['kurtosis'] = kurtosis

        analysis_results['summary_statistics'] = summary_stats
        analysis_results['correlation_matrix'] = correlation_matrix

    except Exception as e:
        analysis_results['error'] = str(e)

    if data.empty:
        raise ValueError("Empty dataset provided for analysis.")

    # Apply user-defined filters
    if filters:
        data = apply_user_filters(data, filters)

    # Filter out rows with missing values
    data = data.dropna()

    # Check if the dataset has numeric columns for analysis
    numeric_columns = data.select_dtypes(include='number').columns
    if not numeric_columns.any():
        raise ValueError("No numeric columns found for analysis.")

    # Example: Calculate mean, standard deviation, etc.
    summary_stats = data.describe()

    # Example: Calculate correlation matrix for numeric columns
    correlation_matrix = data[numeric_columns].corr()

    analysis_results = {'summary_statistics': summary_stats, 'correlation_matrix': correlation_matrix}

    return analysis_results

def apply_user_filters(data, filters):
    """
    Apply user-defined filters to the dataset.

    Parameters:
    - data: DataFrame, the dataset to filter
    - filters: dict, user-defined filters for data

    Returns:
    - filtered_data: DataFrame, the filtered dataset
    """
    filtered_data = data.copy()

    for column, filter_specs in filters.items():
        if 'operator' in filter_specs and 'value' in filter_specs:
            operator = filter_specs['operator']
            value = filter_specs['value']

            if operator == '==':
                filtered_data = filtered_data.loc[filtered_data[column] == value]
            elif operator == '!=':
                filtered_data = filtered_data.loc[filtered_data[column] != value]
            elif operator == '<':
                filtered_data = filtered_data.loc[filtered_data[column] < value]
            elif operator == '>':
                filtered_data = filtered_data.loc[filtered_data[column] > value]
            # Add more conditions as needed

    return filtered_data
