from flask import Blueprint, Response, json, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from cache.data_frame_api import \
    DataFrameAPI  # Replace with your actual import path
from configs.config import app
from database.extensions import db
from models.dataset import DatasetModel
from models.user import User

data_bp = Blueprint('data_bp', __name__)

data_frame_api = DataFrameAPI()  # Assuming you have a DataFrameAPI instance globally accessible

@data_bp.route('/data', methods=['GET'])
@jwt_required()
def get_data():
    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()

    # Query for the current user
    current_user = User.query.get(current_user_id)

    # Ensure the current user has access to the data
    if not current_user:
        return jsonify({"message": "Unauthorized"}), 401
    
    # Retrieve data from the DataSetModel or your data source
    data = DatasetModel.query.all() 

    # Update this based on your actual method to get data

    # Serialize the data as needed
    serialized_data = [{'column1': row.column1, 'column2': row.column2} for row in data]

    return jsonify({'data': serialized_data})

@data_bp.route('/data', methods=['POST'])
@jwt_required()
def add_data():
    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()
    # Add your logic to check user permissions if required

    # Example: Assuming JSON data is sent in the request body
    new_data = request.json

    # Your logic to add new data to the DataSetModel or your data source
    new_entry = DatasetModel(column1=new_data['column1'], column2=new_data['column2'])
    db.session.add(new_entry)
    db.session.commit()

    return jsonify({"message": "Data added successfully"})

@data_bp.route('/data/<int:data_id>', methods=['GET'])
@jwt_required()
def get_specific_data(data_id):
    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()
    # Add your logic to check user permissions if required

    # Your logic to retrieve specific data from the DataSetModel or your data source
    specific_data = DatasetModel.query.get(data_id)  # Update this based on your actual method

    if not specific_data:
        return jsonify({"message": "Data not found"}), 404

    # Serialize the data as needed
    serialized_specific_data = {'column1': specific_data.column1, 'column2': specific_data.column2}

    return jsonify(serialized_specific_data)

@data_bp.route('/data/<int:data_id>', methods=['PUT'])
@jwt_required()
def update_data(data_id):
    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()
    # Add your logic to check user permissions if required

     # Your logic to update specific data in the DataSetModel or your data source
    specific_data = DatasetModel.query.get(data_id)  # Update this based on your actual method

    if not specific_data:
        return jsonify({"message": "Data not found"}), 404

    # Example: Assuming JSON data is sent in the request body
    updated_data = request.json

      # Your logic to update the specific data
    specific_data.column1 = updated_data['column1']
    specific_data.column2 = updated_data['column2']
    db.session.commit()

    return jsonify({"message": "Data updated successfully"})

@data_bp.route('/data/<int:data_id>', methods=['DELETE'])
@jwt_required()
def delete_data(data_id):
    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()
    # Add your logic to check user permissions if required

    # Your logic to delete specific data from the DataSetModel or your data source
    specific_data = DatasetModel.query.get(data_id)  # Update this based on your actual method

    if not specific_data:
        return jsonify({"message": "Data not found"}), 404

    # Your logic to delete the specific data
    db.session.delete(specific_data)
    db.session.commit()

    return jsonify({"message": "Data deleted successfully"})

@data_bp.route('/data/update_title', methods=['POST'])
@jwt_required()
def update_data_title():
    try:
        # Ensure the current user has the necessary permissions
        current_user_id = get_jwt_identity()
        # Add your logic to check user permissions if required

        # Example: Assuming JSON data is sent in the request body
        update_data = request.json

        # Your logic to update data title in the DataSetModel or your data source
        data_id = update_data.get('id')
        new_title = update_data.get('title')

        specific_data = DatasetModel.query.get(data_id)

        if not specific_data:
            return jsonify({"message": "Data not found"}), 404

        # Update the data title
        specific_data.title = new_title
        db.session.commit()

        return jsonify({"message": "Data title updated successfully"})

    except Exception as e:
        return jsonify({"message": str(e)}), 500

@data_bp.route('/stream_data', methods=['POST'])
@jwt_required()
def stream_data():
    def generate():
        for line in request.get_data(as_text=True).split('\n'):
            try:
                data = json.loads(line)
                # Process the data as needed
                # For example, append it to your DataFrame
                data_frame_api.append_data([data])
            except json.JSONDecodeError as e:
                app.logger.error(f"Error decoding JSON: {e}")

            yield '\n'  # Send a newline to keep the connection alive

    return Response(generate(), content_type='text/event-stream')
