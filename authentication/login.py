from auth import auth_bp
from flask import Flask, redirect, render_template, request, session, url_for
from werkzeug.security import check_password_hash

from config import app
from models.user import User


@app.route('/login', methods=['GET'])
def login_form(): 
    return render_template('login.html')


@auth_bp.route('/login', methods=['POST'])
async def login():
    #todo update flask_jwt
    # data = await request.get_json()
    username = request.form('username')
    password = request.form('password')
    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        session['user_id'] = user.id
        return redirect(url_for('home'))
    
    
    #todo once jwt in auth is set up uncomment
    # if user:
    #     access_token = jwt.jwt_encode_callback(user)
    #     return jsonify({'access_token': access_token.decode('utf-8'), 'user_id': user.id})
    
    # return jsonify({'message': 'Invalid credentials'}), 401
    
    else:
        return render_template('login.html', message='Incorrect username or password')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    return redirect(url_for('login'))