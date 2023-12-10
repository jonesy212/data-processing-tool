from flask import (g, jsonify, redirect, render_template, request, session,
                   url_for)
from flask_jwt_extended import create_access_token, jwt_required
from werkzeug.security import check_password_hash

from authentication.auth import auth_bp
from configs.config import app
from models.user import User

app.route('/dropsession')
def dropsession():
    session.pop('user', None)
    return render_template('login.html')


# Register 'before_request' function
@app.before_request
def before_request():
    # Check if current request is for dropssession route
    if request.endpoint == 'dropsessing:':
        return
    
    # check if the user is ogged in    
    if 'user'in session:
        g.user = session['user']
        
    else:
        g.user = None

    


@app.route('/login', methods=['GET'])
def login_form(): 
    return render_template('login.html')


@auth_bp.route('/login', methods=['POST'])
async def login():
        if request.method == 'POST':

            entered_password = request.form.get('password')
            username = request.form('username')
            password = request.form('password')
            
            user = User.query.filter_by(username=username).first()

            if user and check_password_hash(user.password, entered_password):
                session['user_id'] = user.id
                return redirect(url_for('home'))
            
            if user:
                access_token = create_access_token(identity=user.username)
                return jsonify({'access_token': access_token.decode('utf-8'), 'user_id': user.id})
            else:
                return jsonify({'message': 'Invalid credentials'}), 401
            
# Logout route
@app.route('/logout')
def logout():
    return redirect(url_for('dropsession'))