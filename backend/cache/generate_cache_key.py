from datetime import datetime

# Import the cache key generator
from caching_api import fetch_data_from_source
from flask import Flask, jsonify, request, session
from flask_caching import Cache

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

    # Calculate dynamic timeout based on data volatility
    def calculate_timeout():
        if 'volatile' in request.args:
            return 10  # Set a lower timeout for volatile data
        else:
            return 3600  # Set a longer timeout for less volatile data

    # Generate a cache key with a clear prefix and relevant properties
    cache_key = generate_cache_key('resource', user_id, data_type)

    # Try to get data from cache
    cached_data = cache.get(cache_key)
    if cached_data:
        return jsonify(cached_data)

    # If not in cache, perform the actual data retrieval logic (replace with your logic)
    data = fetch_data_from_source(user_id, data_type)

    # Store the data in cache with the generated cache key and dynamic timeout
    cache.set(cache_key, data, timeout=calculate_timeout())

    return jsonify(data)
