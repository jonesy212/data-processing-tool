# team_routes.py
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.extensions import db
from models.team.team import Team
from models.user import User
from pagination.get_pagination_users import (get_paginated_teams,
                                             get_pagination_parameters)

team_bp = Blueprint('team_bp', __name__)

@team_bp.route('/teams', methods=['GET'])
@jwt_required()
def get_teams():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    page, per_page = get_pagination_parameters()

    paginated_teams = get_paginated_teams(page, per_page)

    serialized_teams = [{'id': team.id, 'name': team.team_name} for team in paginated_teams.items]

    return jsonify({
        'teams': serialized_teams,
        'total_pages': paginated_teams.pages,
        'current_page': paginated_teams.page,
        'total_items': paginated_teams.total
    })

@team_bp.route('/teams/<int:team_id>', methods=['GET'])
@jwt_required()
def get_team(team_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    team = Team.query.get(team_id)

    if not team:
        return jsonify({"message": "Team not found"}), 404

    serialized_team = {'id': team.id, 'name': team.team_name}

    return jsonify(serialized_team)

@team_bp.route('/teams', methods=['POST'])
@jwt_required()
def create_team():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    new_team_data = request.json

    # Your logic to create a new team in the database
    new_team = Team(**new_team_data)
    db.session.add(new_team)
    db.session.commit()

    serialized_team = {'id': new_team.id, 'name': new_team.team_name}

    return jsonify(serialized_team), 201

@team_bp.route('/teams/<int:team_id>', methods=['PUT'])
@jwt_required()
def update_team(team_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    team = Team.query.get(team_id)

    if not team:
        return jsonify({"message": "Team not found"}), 404

    update_data = request.json

    # Your logic to update the team in the database
    team.team_name = update_data.get('name', team.team_name)
    # Update other team properties as needed

    db.session.commit()

    serialized_team = {'id': team.id, 'name': team.team_name}

    return jsonify(serialized_team)

@team_bp.route('/teams/<int:team_id>', methods=['DELETE'])
@jwt_required()
def delete_team(team_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user or current_user.tier != 'admin':
        return jsonify({"message": "Unauthorized"}), 401

    team = Team.query.get(team_id)

    if not team:
        return jsonify({"message": "Team not found"}), 404

    db.session.delete(team)
    db.session.commit()

    return jsonify({"message": "Team deleted successfully"})
