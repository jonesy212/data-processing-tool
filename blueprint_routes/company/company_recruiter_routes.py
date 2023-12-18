# company_recruiter_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.extensions import db
from models.company.company_recruiters import \
    CompanyRecruiters  # Import your CompanyRecruiters model
from models.user.user import User

company_recruiter_routes = Blueprint('company_recruiter_routes', __name__)

@company_recruiter_routes.route('/company_recruiters', methods=['GET'])
@jwt_required()
def get_company_recruiters():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    company_recruiters = CompanyRecruiters.query.all()

    serialized_company_recruiters = [
        {'id': cr.id, 'company_id': cr.company_id, 'recruiter_id': cr.recruiter_id} for cr in company_recruiters
    ]

    return jsonify(serialized_company_recruiters)

@company_recruiter_routes.route('/company_recruiters/<int:company_recruiter_id>', methods=['GET'])
@jwt_required()
def get_company_recruiter(company_recruiter_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    company_recruiter = CompanyRecruiters.query.get(company_recruiter_id)

    if not company_recruiter:
        return jsonify({"message": "Company Recruiter not found"}), 404

    serialized_company_recruiter = {
        'id': company_recruiter.id,
        'company_id': company_recruiter.company_id,
        'recruiter_id': company_recruiter.recruiter_id
    }

    return jsonify(serialized_company_recruiter)

@company_recruiter_routes.route('/company_recruiters', methods=['POST'])
@jwt_required()
def create_company_recruiter():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    new_company_recruiter_data = request.json

    # Validate the required fields in new_company_recruiter_data
    if 'company_id' not in new_company_recruiter_data or 'recruiter_id' not in new_company_recruiter_data:
        return jsonify({"message": "Missing required fields"}), 400

    # Create a new company recruiter relationship
    new_company_recruiter = CompanyRecruiters(
        company_id=new_company_recruiter_data['company_id'],
        recruiter_id=new_company_recruiter_data['recruiter_id']
        # Add other fields as needed
    )

    # Add the new company recruiter relationship to the database
    db.session.add(new_company_recruiter)
    db.session.commit()

    serialized_company_recruiter = {
        'id': new_company_recruiter.id,
        'company_id': new_company_recruiter.company_id,
        'recruiter_id': new_company_recruiter.recruiter_id
    }

    return jsonify(serialized_company_recruiter), 201

@company_recruiter_routes.route('/company_recruiters/<int:company_recruiter_id>', methods=['PUT'])
@jwt_required()
def update_company_recruiter(company_recruiter_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    company_recruiter = CompanyRecruiters.query.get(company_recruiter_id)

    if not company_recruiter:
        return jsonify({"message": "Company Recruiter not found"}), 404

    updated_data = request.json

    # Update company recruiter relationship based on the request
    company_recruiter.company_id = updated_data.get('company_id', company_recruiter.company_id)
    company_recruiter.recruiter_id = updated_data.get('recruiter_id', company_recruiter.recruiter_id)
    # Update other fields as needed

    db.session.commit()

    serialized_company_recruiter = {
        'id': company_recruiter.id,
        'company_id': company_recruiter.company_id,
        'recruiter_id': company_recruiter.recruiter_id
    }

    return jsonify(serialized_company_recruiter)

@company_recruiter_routes.route('/company_recruiters/<int:company_recruiter_id>', methods=['DELETE'])
@jwt_required()
def delete_company_recruiter(company_recruiter_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    company_recruiter = CompanyRecruiters.query.get(company_recruiter_id)

    if not company_recruiter:
        return jsonify({"message": "Company Recruiter not found"}), 404

    db.session.delete(company_recruiter)
    db.session.commit()

    return jsonify({"message": "Company Recruiter relationship deleted successfully"})
