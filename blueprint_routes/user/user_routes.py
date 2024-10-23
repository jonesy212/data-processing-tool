# user_bp.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.extensions import db
from models.user.user import User
from pagination.get_pagination_users import (get_paginated_users,
                                             get_pagination_parameters)

user_bp = Blueprint('user_bp', __name__)

@user_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():

    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401
    
    page, per_page = get_pagination_parameters()
        
    # Get paginated user using SQLAlchemy pagination
    paginated_users = get_paginated_users(page, per_page)

    # Serialize the user data as needed
    serialized_users = [{'id': user.id, 'username': user.username, 'email': user.email} for user in paginated_users.items]

    return jsonify({
        'users': serialized_users,
        'total_pages': paginated_users.pages,
        'current_page': paginated_users.page,
        'total_items': paginated_users.total
    })

@user_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or (current_user.tier != 'admin' and current_user.id != user_id):
        return jsonify({"message": "Unauthorized"}), 401

    # Your logic to get a specific user from the database
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Serialize the user data as needed
    serialized_user = {'id': user.id, 'username': user.username, 'email': user.email}
    
    return jsonify(serialized_user)


@user_bp.route('/users/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or (current_user.tier != 'admin' and current_user.id != user_id):
        return jsonify({"message": "Unauthorized"}), 401

    # Your logic to update a specific user in the database
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Update user data based on the request
    new_data = request.json
    user.username = new_data.get('username', user.username)
    user.email = new_data.get('email', user.email)

    # Commit the changes to the database
    db.session.commit()

    # Serialize the updated user data as needed
    serialized_user = {'id': user.id, 'username': user.username, 'email': user.email}

    return jsonify(serialized_user)

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or (current_user.tier != 'admin' and current_user.id != user_id):
        return jsonify({"message": "Unauthorized"}), 401

    # Your logic to delete a specific user from the database
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    # Delete the user
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"})

@user_bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    # Ensure the current user has the necessary permissions
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    # Get search parameters from the request
    search_query = request.args.get('q')

    # Your logic to search for users based on the query
    users = User.query.filter(User.username.ilike(f'%{search_query}%') | User.email.ilike(f'%{search_query}%')).all()

    # Serialize the search results as needed
    serialized_users = [{'id': user.id, 'username': user.username, 'email': user.email} for user in users]

    return jsonify(serialized_users)