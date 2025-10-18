# recruiter_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.extensions import db
from models.user import User
from models.user_type.recruiter_profile import RecruiterProfile

recruiter_routes = Blueprint('recruiter_routes', __name__)

@recruiter_routes.route('/recruiters', methods=['GET'])
@jwt_required()
def get_recruiters():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    recruiters = RecruiterProfile.query.all()

    serialized_recruiters = [{'id': recruiter.id, 'company_name': recruiter.company_name, 'industry': recruiter.industry} for recruiter in recruiters]

    return jsonify(serialized_recruiters)

@recruiter_routes.route('/recruiters/<int:recruiter_id>', methods=['GET'])
@jwt_required()
def get_recruiter(recruiter_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    recruiter = RecruiterProfile.query.get(recruiter_id)

    if not recruiter:
        return jsonify({"message": "Recruiter not found"}), 404

    serialized_recruiter = {'id': recruiter.id, 'company_name': recruiter.company_name, 'industry': recruiter.industry}

    return jsonify(serialized_recruiter)

@recruiter_routes.route('/recruiters', methods=['POST'])
@jwt_required()
def create_recruiter():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    new_recruiter_data = request.json

    # Validate the required fields in new_recruiter_data
    if 'company_name' not in new_recruiter_data or 'industry' not in new_recruiter_data:
        return jsonify({"message": "Missing required fields"}), 400

    # Create a new recruiter profile
    new_recruiter = RecruiterProfile(
        user_id=new_recruiter_data['user_id'],
        company_name=new_recruiter_data['company_name'],
        industry=new_recruiter_data['industry'],
        # Add other fields as needed
    )

    # Add the new recruiter profile to the database
    db.session.add(new_recruiter)
    db.session.commit()

    serialized_recruiter = {'id': new_recruiter.id, 'company_name': new_recruiter.company_name, 'industry': new_recruiter.industry}

    return jsonify(serialized_recruiter), 201

@recruiter_routes.route('/recruiters/<int:recruiter_id>', methods=['PUT'])
@jwt_required()
def update_recruiter(recruiter_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    recruiter = RecruiterProfile.query.get(recruiter_id)

    if not recruiter:
        return jsonify({"message": "Recruiter not found"}), 404

    updated_data = request.json

    # Update recruiter data based on the request
    recruiter.company_name = updated_data.get('company_name', recruiter.company_name)
    recruiter.industry = updated_data.get('industry', recruiter.industry)
    # Update other fields as needed

    db.session.commit()

    serialized_recruiter = {'id': recruiter.id, 'company_name': recruiter.company_name, 'industry': recruiter.industry}

    return jsonify(serialized_recruiter)

@recruiter_routes.route('/recruiters/<int:recruiter_id>', methods=['DELETE'])
@jwt_required()
def delete_recruiter(recruiter_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    recruiter = RecruiterProfile.query.get(recruiter_id)

    if not recruiter:
        return jsonify({"message": "Recruiter not found"}), 404

    db.session.delete(recruiter)
    db.session.commit()

    return jsonify({"message": "Recruiter deleted successfully"})
