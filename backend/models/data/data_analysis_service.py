# services/data_analysis_service.py

import requests  # Instead of Axios, use the 'requests' library for Python
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from models.data.data_analysis import DataAnalysis

data_analysis_bp = Blueprint('data_analysis_bp', __name__)  # Create a Flask Blueprint if not already done

class DataAnalysisService:
    @staticmethod
    def fetch_data_analysis():
        try:
            # Replace 'yourApiEndpoint' with the actual API endpoint
            response = requests.get('http://your-api-base-url/api/data-analysis')
            response.raise_for_status()  # Raise an exception for bad responses
            data_analysis_list = [DataAnalysis(**data) for data in response.json()]
            return data_analysis_list

        except requests.exceptions.RequestException as e:
            # Handle request exceptions (e.g., connection error, timeout)
            print(f"Error fetching data analysis: {e}")
            return []

# Register the route for fetching data analysis using the Blueprint
@data_analysis_bp.route('/fetch-data-analysis', methods=['GET'])
@jwt_required()
def fetch_data_analysis_route():
    data_analysis_service = DataAnalysisService()
    data_analysis_list = data_analysis_service.fetch_data_analysis()
    return jsonify(data_analysis_list), 200
