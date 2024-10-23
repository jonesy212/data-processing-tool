# Updated code with enhanced cache key generation

from datetime import datetime

from flask import Flask, jsonify, request, session
from flask_caching import Cache
from generate_cache_key import \
    generate_cache_key  # Import the cache key generator

from models.user.get_remote_address import get_remote_address

app = Flask(__name__)
cache = Cache(app)

# Function to generate a cache key based on partial property names
def generate_cache_key(prefix, *args, **kwargs):
    # Combine the prefix and property names to create a unique cache key
    key = f"{prefix}_{'_'.join(map(str, args))}_{'_'.join(f'{k}={v}' for k, v in kwargs.items())}"
    return key

# Function to calculate dynamic timeout based on data volatility
def calculate_timeout():
    if 'volatile' in request.args:
        return 10  # Set a lower timeout for volatile data
    else:
        return 3600  # Set a longer timeout for less volatile data

# Function to fetch data from the data source
def fetch_data_from_source(user_id, data_type):
    try:
        # Simulate fetching data from a database or external API
        # Replace this with your actual logic to fetch data
        if data_type == session.user_profile:
            # Simulate fetching user profile data
            data = {'user_id': user_id, 'data_type': data_type, 'profile': {'name': 'John Doe', 'email': 'john@example.com'}}
        elif data_type == 'user_activity':
            # Simulate fetching user activity data
            data = {'user_id': user_id, 'data_type': data_type, 'activity': {'logins': 20, 'last_login': str(datetime.now())}}
        else:
            # Handle unknown data type
            raise DataRetrievalError(f"Unknown data type: {data_type}")

        return data
    except Exception as e:
        # Log the exception or handle it according to your application's needs
        raise DataRetrievalError(f"Error fetching data: {str(e)}")

# Rest of the code remains the same
# ..
app = Flask(__name__)
cache = Cache(app)

# Function to generate a cache key based on partial property names
def generate_cache_key(prefix, *args, **kwargs):
    # Combine the prefix and property names to create a unique cache key
    key = f"{prefix}_{'_'.join(map(str, args))}_{'_'.join(f'{k}={v}' for k, v in kwargs.items())}"
    return key




# Example API endpoint with caching
@app.route('/api/resource', methods=['GET'])
def get_resource():
    # Extract relevant properties from the request (replace with your actual logic)
    user_id = request.args.get('user_id')
    data_type = request.args.get('data_type')

    # Get the remote address using the imported function
    remote_address = get_remote_address()

    # Generate a cache key with a clear prefix and relevant properties using the imported function
    cache_key = generate_cache_key('resource', user_id, data_type, remote_address)

    # Try to get data from cache
    cached_data = cache.get(cache_key)
    if cached_data:
        return jsonify(cached_data)

    # If not in cache, perform the actual data retrieval logic
    data = fetch_data_from_source(user_id, data_type)

    # Store the data in cache with the generated cache key and dynamic timeout
    cache.set(cache_key, data, timeout=calculate_timeout())

    return jsonify(data)



class DataRetrievalError(Exception):
    """
    Custom exception class for errors occurring during data retrieval.

    This exception is raised when there is an error fetching data from a database or external API.
    """

    def __init__(self, message):
        """
        Initialize the DataRetrievalError.

        Parameters:
            message (str): The error message describing the reason for the exception.
        """
        super().__init__(message)




def fetch_data_from_source(user_id, data_type):
    try:
        # Simulate fetching data from a database or external API
        # Replace this with your actual logic to fetch data
        if data_type == session.user_profile:
            # Simulate fetching user profile data
            data = {'user_id': user_id, 'data_type': data_type, 'profile': {'name': 'John Doe', 'email': 'john@example.com'}}
        elif data_type == 'user_activity':
            # Simulate fetching user activity data
            data = {'user_id': user_id, 'data_type': data_type, 'activity': {'logins': 20, 'last_login': str(datetime.now())}}
        else:
            # Handle unknown data type
            raise DataRetrievalError(f"Unknown data type: {data_type}")
        
        return data
    except Exception as e:
        # Log the exception or handle it according to your application's needs
        raise DataRetrievalError(f"Error fetching data: {str(e)}")
