
# # Implement registration and login routes here
# auth.py
from flask import Flask, redirect, render_template, request, session, url_for
from flask_login import LoginManager, login_required, login_user, logout_user
from werkzeug.security import check_password_hash, generate_password_hash

from user.user import User

login_manager = LoginManager()

def init_login_manager(app):
    login_manager.init_app(app)
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
    
app = Flask(__name__)
app.secret_key = 'your_secret_key'

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.user_loader(lambda user_id: User.query.get(int(user_id)))


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        # Check if passwords match
        if password != confirm_password:
            return render_template('register.html', message='Passwords do not match')

        # Hash the password before saving it
        hashed_password = generate_password_hash(password, method='sha256')

        # Create a new user instance
        new_user = User(username=username, email=email, password=hashed_password)

        # todo # Add the user to the database
        # db.session.add(new_user)
        # db.session.commit()

        # Redirect to login page
        return redirect(url_for('login'))

    return render_template('register.html')


from user.user import User
