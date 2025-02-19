# polynomial_features.py
import pandas as pd
from sklearn.preprocessing import PolynomialFeatures


def generate_polynomial_features_task(data, feature_list, degree=2):
    # Generate polynomial features to capture non-linear relationships
    poly = PolynomialFeatures(degree=degree, include_bias=False)
    poly_features = poly.fit_transform(data[feature_list])
    poly_columns = [f'Poly_{i}' for i in range(1, poly_features.shape[1] + 1)]
    data[poly_columns] = pd.DataFrame(poly_features, columns=poly_columns)

# Example usage:
# generate_polynomial_features(your_data_frame, ['Feature1', 'Feature2'], degree=2)
