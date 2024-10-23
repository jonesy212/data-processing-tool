# fetch_data_withh_token.py
import os

import requests


def fetchDataWithToken():
    try:
        auth_token = os.environ.get("YOUR_AUTH_TOKEN")
        if not auth_token:
            raise ValueError("Authentication token not found in environment variables")

        headers = {
            'Authorization': f'Bearer {auth_token}',
            'Accept': 'application/json'
        }

        # Assuming you're using the requests library for HTTP requests
        response = requests.get('https://api.yourapp.com/v1/data', headers=headers)
        data = response.json()
        print(data)
    except Exception as e:
        print('Error:', e)

# Call the function to fetch data using the authentication token
fetchDataWithToken()
