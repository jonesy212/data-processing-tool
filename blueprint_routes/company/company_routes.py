# company_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.extensions import db
from models.company.company import Company  # Import your Company model
from models.company.department import Department
from models.user.user import User  # Import your User model

company_bp = Blueprint('company_bp', __name__)

@company_bp.route('/companies', methods=['GET'])
@jwt_required()
def get_companies():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    companies = Company.query.all()

    serialized_companies = [{'id': company.id, 'name': company.name, 'industry': company.industry} for company in companies]

    return jsonify(serialized_companies)

@company_bp.route('/companies/<int:company_id>', methods=['GET'])
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

@company_bp.route('/companies', methods=['POST'])
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

@company_bp.route('/companies/<int:company_id>', methods=['PUT'])
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

@company_bp.route('/companies/<int:company_id>', methods=['DELETE'])
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


# company_routes.py


# Routes for managing employees
@company_bp.route('/employees', methods=['GET'])
@jwt_required()
def get_employees():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user or current_user.tier != 'admin':
            return jsonify({"message": "Unauthorized"}), 401

        company_id = current_user.company_id
        company = Company.query.get(company_id)

        if not company:
            return jsonify({"message": "Company not found"}), 404

        employees = company.employees
        serialized_employees = [{'id': employee.id, 'username': employee.username, 'email': employee.email} for employee in employees]

        return jsonify(serialized_employees), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@company_bp.route('/employees', methods=['POST'])
@jwt_required()
def create_employee():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user or current_user.tier != 'admin':
            return jsonify({"message": "Unauthorized"}), 401

        company_id = current_user.company_id
        company = Company.query.get(company_id)

        if not company:
            return jsonify({"message": "Company not found"}), 404

        new_employee_data = request.json

        # Validate the required fields in new_employee_data
        if 'username' not in new_employee_data or 'email' not in new_employee_data:
            return jsonify({"message": "Missing required fields"}), 400

        # Create a new employee
        new_employee = User(
            username=new_employee_data['username'],
            email=new_employee_data['email'],
            password=new_employee_data.get('password'),  # Ensure to hash the password before saving
            company=company,
            tier='employee'  # Set the appropriate tier for employees
            # Add other fields as needed
        )

        # Add the new employee to the database
        db.session.add(new_employee)
        db.session.commit()

        serialized_employee = {'id': new_employee.id, 'username': new_employee.username, 'email': new_employee.email}

        return jsonify(serialized_employee), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Routes for managing contractors
@company_bp.route('/contractors', methods=['GET'])
@jwt_required()
def get_contractors():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user or current_user.tier != 'admin':
            return jsonify({"message": "Unauthorized"}), 401

        company_id = current_user.company_id
        company = Company.query.get(company_id)

        if not company:
            return jsonify({"message": "Company not found"}), 404

        contractors = company.contractors
        serialized_contractors = [{'id': contractor.id, 'username': contractor.username, 'email': contractor.email} for contractor in contractors]

        return jsonify(serialized_contractors), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@company_bp.route('/contractors', methods=['POST'])
@jwt_required()
def create_contractor():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user or current_user.tier != 'admin':
            return jsonify({"message": "Unauthorized"}), 401

        company_id = current_user.company_id
        company = Company.query.get(company_id)

        if not company:
            return jsonify({"message": "Company not found"}), 404

        new_contractor_data = request.json

        # Validate the required fields in new_contractor_data
        if 'username' not in new_contractor_data or 'email' not in new_contractor_data:
            return jsonify({"message": "Missing required fields"}), 400

        # Create a new contractor
        new_contractor = User(
            username=new_contractor_data['username'],
            email=new_contractor_data['email'],
            password=new_contractor_data.get('password'),  # Ensure to hash the password before saving
            contractor_company=company,
            tier='contractor'  # Set the appropriate tier for contractors
            # Add other fields as needed
        )

        # Add the new contractor to the database
        db.session.add(new_contractor)
        db.session.commit()

        serialized_contractor = {'id': new_contractor.id, 'username': new_contractor.username, 'email': new_contractor.email}

        return jsonify(serialized_contractor), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Routes for managing departments
@company_bp.route('/departments', methods=['POST'])
@jwt_required()
def create_department():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    new_department_data = request.json

    # Validate the required fields in new_department_data
    if 'name' not in new_department_data:
        return jsonify({"message": "Missing required fields"}), 400

    # Create a new department
    new_department = Department(
        name=new_department_data['name']
        # Add other fields as needed
    )

    # Add the new department to the database
    db.session.add(new_department)
    db.session.commit()

    serialized_department = {'id': new_department.id, 'name': new_department.name}

    return jsonify(serialized_department), 201

# Routes for managing departments
@company_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user or current_user.tier != 'admin':
            return jsonify({"message": "Unauthorized"}), 401

        company_id = current_user.company_id
        company = Company.query.get(company_id)

        if not company:
            return jsonify({"message": "Company not found"}), 404

        departments = company.departments
        serialized_departments = [{'id': department.id, 'name': department.name} for department in departments]

        return jsonify(serialized_departments), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
