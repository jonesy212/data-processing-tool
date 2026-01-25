from flask import (Blueprint, g, jsonify, redirect, render_template, request,
                   session, url_for)
from flask_jwt_extended import create_access_token, jwt_required
from werkzeug.security import check_password_hash

from authentication.auth import auth_bp
from configs.config import app
from models.user.user import User
from utils.system_utils.generate_html_from_tsx import generated_html_files

login_bp = Blueprint('login', __name__)

@login_bp.route('/dropsession')
@jwt_required()
def dropsession():
    session.pop('user', None)
    return render_template('Login.tsx')

@login_bp.before_request
@jwt_required()
def before_request():
    if request.endpoint == 'dropsession':
        return
    
    if 'user' in session:
        g.user = session['user']
    else:
        g.user = None

@login_bp.route('/login', methods=['GET'])
def login_form(): 
    login_form_html = ''.join([open(html_file, 'r').read() for html_file in generated_html_files])
    return render_template('Login.tsx', login_form_html=login_form_html)

@auth_bp.route('/login', methods=['POST'])
async def login():
    if request.method == 'POST':
        entered_password = request.form.get('password')
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, entered_password):
            session['user_id'] = user.id
            return redirect(url_for('home'))
        
        if user:
            access_token = create_access_token(identity=user.username)
            return jsonify({'access_token': access_token.decode('utf-8'), 'user_id': user.id})
        else:
            return jsonify({'message': 'Invalid credentials'}), 401

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return redirect(url_for('dropsession'))
