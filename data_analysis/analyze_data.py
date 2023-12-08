# data_analysis.py
def analyze_data(data):
    """
    Analyze the dataset and return summary statistics.

    Parameters:
    - data: DataFrame, the dataset for analysis

    Returns:
    - analysis_results: dict, summary statistics
    """
    # Example: Calculate mean, standard deviation, etc.
    summary_stats = data.describe()

    # Example: Calculate correlation matrix
    correlation_matrix = data.corr()

    analysis_results = {'summary_statistics': summary_stats, 'correlation_matrix': correlation_matrix}
    return analysis_results