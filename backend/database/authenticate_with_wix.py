import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def authenticate_with_wix(api_key, api_secret):
    """
    Authenticate with the Wix API using the provided API key and secret.
    Returns the access token if authentication is successful, None otherwise.
    """
    # Wix API authentication endpoint
    auth_url = "https://www.wix.com/oauth/access"
    
    # Request payload
    payload = {
        "grant_type": "client_credentials",
        "client_id": api_key,
        "client_secret": api_secret
    }
    
    try:
        # Send POST request to authenticate
        response = requests.post(auth_url, data=payload)
        if response.status_code == 200:
            # Authentication successful, extract access token from response
            access_token = response.json().get("access_token")
            return access_token
        else:
            # Authentication failed, print error message
            print("Failed to authenticate with Wix API. Status code:", response.status_code)
            return None
    except requests.exceptions.RequestException as e:
        # Handle request errors
        print("Error occurred during authentication:", e)
        return None

def fetch_user_data(access_token):
    """
    Fetch user data from the Wix API using the provided access token.
    Returns user data if successful, None otherwise.
    """
    # Wix API endpoint to fetch user data
    user_data_url = "https://www.wix.com/api/v1/user"
    
    try:
        # Send GET request to fetch user data
        headers = {"Authorization": f"Bearer {access_token}"}
        response = requests.get(user_data_url, headers=headers)
        if response.status_code == 200:
            # User data fetched successfully
            user_data = response.json()
            return user_data
        else:
            # Failed to fetch user data, print error message
            print("Failed to fetch user data from Wix API. Status code:", response.status_code)
            return None
    except requests.exceptions.RequestException as e:
        # Handle request errors
        print("Error occurred while fetching user data:", e)
        return None

# Example usage:
wix_api_key = os.getenv("WIX_API_KEY")
wix_api_secret = os.getenv("WIX_API_SECRET")

# Authenticate with Wix API
access_token = authenticate_with_wix(wix_api_key, wix_api_secret)
if access_token:
    # Authentication successful, fetch user data
    user_data = fetch_user_data(access_token)
    if user_data:
        # User data fetched successfully, do something with it
        print("User data:", user_data)
