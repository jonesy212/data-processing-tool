# custom_feature.py
def create_custom_feature_task(data, feature_expression, new_feature_name):
    # Create a custom feature based on a mathematical expression
    data[new_feature_name] = eval(feature_expression)

# Example usage:
# create_custom_feature(your_data_frame, 'Column1 + Column2', 'CustomFeature')
