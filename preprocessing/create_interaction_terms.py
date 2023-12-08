# interaction_terms.py
def create_interaction_terms_task(data, feature1, feature2):
    # Multiply or combine two or more features to capture interaction effects
    data[f'{feature1}_{feature2}_interaction'] = data[feature1] * data[feature2]

# Example usage:
# create_interaction_terms(your_data_frame, 'Feature1', 'Feature2')
