# onboarding_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from onboarding.onboarding_data import OnboardingData

from database.extensions import db
from models.user.user import User

onboarding_routes = Blueprint('onboarding_routes', __name__)

@onboarding_routes.route('/onboarding/questionnaire-submit', methods=['POST'])
@jwt_required()
def submit_questionnaire():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_responses = request.json.get('userResponses')

        # Process and save questionnaire responses
        onboarding_data = OnboardingData(user_id=current_user_id, questionnaire_responses=user_responses)
        db.session.add(onboarding_data)
        db.session.commit()

        return jsonify({'message': 'Questionnaire submitted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@onboarding_routes.route('/onboarding/profile-setup', methods=['POST'])
@jwt_required()
def profile_setup():
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"error": "User not found"}), 404

        profile_data = request.json.get('profileData')

        # Process and save profile setup data
        user.username = profile_data.get('username', user.username)
        user.email = profile_data.get('email', user.email)
        # Add more fields as needed

        db.session.commit()

        return jsonify({'message': 'Profile setup successful'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
