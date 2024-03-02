from cache_manager import default_cache_manager
from flask import jsonify, request

from configs.config import app
from logging_system.warning_events import log_exception

# Get updated profile data from the request
updated_data = request.json

# Validate updated data format
if not updated_data:
    raise ValueError("No data received")
from schemas.preferences import PreferencesSchema

preferences_schema = PreferencesSchema()
if not preferences_schema.validate(updated_data):
    raise ValueError("Invalid data format received")
default_cache_manager.synchronize_cache_from_frontend(updated_data)


# API endpoint for cache synchronization
@app.route('/api/synchronize_cache', methods=['POST'])
def synchronize_cache_from_frontend():
    try:
        # Get the updated data from the request
        updated_data = request.json.get('preferences')  # Adjust the key based on your data structure

        # Synchronize the cache with the received data
        default_cache_manager.synchronize_cache_from_frontend(updated_data)
        # Assuming updated_data contains preferences
        preferences = updated_data.get('preferences', {})
        # Synchronize the cache with updated preferences
        default_cache_manager.synchronize_cache_from_frontend(preferences)
    
        return jsonify({'message': 'Cache synchronized successfully'})
    except Exception as e:
        log_exception(f"Failed to synchronize cache from frontend. Error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
    
    