# services/data_analysis_service.py

import axios

from models.data_analysis import DataAnalysis


class DataAnalysisService:
    @staticmethod
    def fetch_data_analysis():
        # Replace 'yourApiEndpoint' with the actual API endpoint
        response = axios.get('/api/data-analysis')
        data_analysis_list = [DataAnalysis(**data) for data in response.data]
        return data_analysis_list

    # Add more methods as needed
