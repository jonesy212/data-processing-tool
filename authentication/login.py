from auth import auth_bp
from flask import jsonify, redirect, render_template, request, session, url_for
from flask_jwt_extended import create_access_token, jwt_required
from werkzeug.security import check_password_hash

from configs.config import app
from models.user import User


@app.route('/login', methods=['GET'])
def login_form(): 
    return render_template('login.html')


@auth_bp.route('/login', methods=['POST'])
async def login():
    
    data = await request.get_json()
    access_token = create_access_token(identity=data['username'])
    username = request.form('username')
    password = request.form('password')
    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id
        return redirect(url_for('home'))
    
    if user:
        access_token = jwt_required.jwt_encode_callback(user)
        return jsonify({'access_token': access_token.decode('utf-8'), 'user_id': user.id})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401
    

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))