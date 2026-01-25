import pandas as pd


def time_since_event_task(data, event_column, time_column, new_feature_name):
    """
    Calculate the time elapsed since the first occurrence of an event for each row in the DataFrame.

    Parameters:
    - data (pd.DataFrame): The input DataFrame.
    - event_column (str): The column containing event information.
    - time_column (str): The column containing timestamp information.
    - new_feature_name (str): The name for the new feature column.

    Example:
    time_since_event_task(your_data_frame, 'EventColumn', 'TimeColumn', 'TimeSinceEvent')
    """
    # Ensure the event and time columns exist in the DataFrame
    if event_column not in data.columns or time_column not in data.columns:
        print(f"Error: Columns {event_column} or {time_column} not found in the provided data.")
        return


    # Sort the data by time_column to ensure correct time calculations
    data.sort_values(by=[event_column, time_column], inplace=True)

    # Group by event_column and calculate the time since the first event for each group
    data[new_feature_name] = data.groupby(event_column)[time_column].transform(lambda x: x - x.min())

    # Handle scenarios where there is no event occurrence or only one event occurrence
    data[new_feature_name] = data[new_feature_name].dt.total_seconds().fillna(0)

    # Reset the index after sorting
    data.sort_index(inplace=True)

    # Calculate the time since the first event for each group
    data[new_feature_name] = (
        data.groupby(event_column)[time_column].transform(lambda x: x - x.min())
    ).dt.total_seconds()

    # Reset the index after sorting
    data.sort_index(inplace=True)
