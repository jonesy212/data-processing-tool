# company_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.extensions import db
from models.company.company import Company  # Import your Company model

company_routes = Blueprint('company_routes', __name__)

@company_routes.route('/companies', methods=['GET'])
@jwt_required()
def get_companies():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    companies = Company.query.all()

    serialized_companies = [{'id': company.id, 'name': company.name, 'industry': company.industry} for company in companies]

    return jsonify(serialized_companies)

@company_routes.route('/companies/<int:company_id>', methods=['GET'])
@jwt_required()
def get_company(company_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    company = Company.query.get(company_id)

    if not company:
        return jsonify({"message": "Company not found"}), 404

    serialized_company = {'id': company.id, 'name': company.name, 'industry': company.industry}

    return jsonify(serialized_company)

@company_routes.route('/companies', methods=['POST'])
@jwt_required()
def create_company():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    new_company_data = request.json

    # Validate the required fields in new_company_data
    if 'name' not in new_company_data or 'industry' not in new_company_data:
        return jsonify({"message": "Missing required fields"}), 400

    # Create a new company
    new_company = Company(
        name=new_company_data['name'],
        industry=new_company_data['industry']
        # Add other fields as needed
    )

    # Add the new company to the database
    db.session.add(new_company)
    db.session.commit()

    serialized_company = {'id': new_company.id, 'name': new_company.name, 'industry': new_company.industry}

    return jsonify(serialized_company), 201

@company_routes.route('/companies/<int:company_id>', methods=['PUT'])
@jwt_required()
def update_company(company_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    company = Company.query.get(company_id)

    if not company:
        return jsonify({"message": "Company not found"}), 404

    updated_data = request.json

    # Update company data based on the request
    company.name = updated_data.get('name', company.name)
    company.industry = updated_data.get('industry', company.industry)
    # Update other fields as needed

    db.session.commit()

    serialized_company = {'id': company.id, 'name': company.name, 'industry': company.industry}

    return jsonify(serialized_company)

@company_routes.route('/companies/<int:company_id>', methods=['DELETE'])
@jwt_required()
def delete_company(company_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    company = Company.query.get(company_id)

    if not company:
        return jsonify({"message": "Company not found"}), 404

    db.session.delete(company)
    db.session.commit()

    return jsonify({"message": "Company deleted successfully"})
