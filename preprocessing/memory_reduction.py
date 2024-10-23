import pandas as pd


def reduce_memory_usage(df, verbose=True):
    """
    Reduce memory usage of a pandas DataFrame by dynamically accessing necessary fields.
    
    Parameters:
        df (pd.DataFrame): The DataFrame to be optimized.
        verbose (bool): If True, display memory usage information. Default is True.
    
    Returns:
        pd.DataFrame: The optimized DataFrame.
    """
    if verbose:
        print("Baseline Memory Usage:")
        df.info(memory_usage='deep')
    
    for col in df.columns:
        col_dtype = df[col].dtype
        if col_dtype == 'object':
            df[col] = df[col].astype('category')
        elif col_dtype != 'datetime64[ns]':
            df[col] = pd.to_numeric(df[col], downcast='integer' if 'int' in str(col_dtype) else 'float', errors='ignore')
    
    if verbose:
        print("\nOptimized Memory Usage:")
        df.info(memory_usage='deep')
    
    return df

# Example of use:
# df = reduce_memory_usage(original_df)
