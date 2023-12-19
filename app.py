
# app.py
import asyncio

import pandas as pd
from flask import (Flask, g, jsonify, redirect, render_template, request,
                   session, url_for)
from flask_caching import Cache
from flask_limiter import Limiter
from flask_login import login_required
from flask_migrate import Migrate

from authentication.auth import auth_bp
from blueprint_routes.register_routes import register
from configs.config import app as configure_flask_app
from configs.config import configure_app
from database.extensions import create_database, db
from dataprocessing.data_processing import load_and_process_data
from dataset.dataset_upload import upload_dataset
from logging_system.audit_logger import AuditingLogger
from logging_system.logger_config import setup_logging
from logging_system.warning_events import log_exception, log_warning
from models.user.get_remote_address import get_remote_address
from models.user.user import User
from preprocessing.clean_transformed_data import (clean_and_transform_data,
                                                  process_data_async)

# create gobao instance of AuditingLogger
auditor = AuditingLogger(log_file='auditing.log')
migrate = Migrate()


def create_app(config_file=None):

    app = Flask(__name__)
    
    # Error handler for unexpected errors
    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        log_warning(f"Unexpected error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    
    cache = Cache(app)
    setup_logging()
    if config_file:
        app.config.from_envvar(config_file)
    else:
        app.config.from_object('config.Config')  # Change to 'config.ProductionConfig' for production

    configure_app(app)
    
    db.init_db(app)
    migrate.init_app(app, db)
    limiter = Limiter(app, key_func=get_remote_address)

    # Set up rate limiting rules
    limiter.limit("5 per minute")(register)  # Limit the register route to 5 requests per minute

   
    @cache.cached(timeout=50, key_prefix='index_data')
    @app.route('/', methods=['GET', 'POST'])
    def index():
        if request.method == 'POST':
            session.pop('user', None)
            
            user = User.query.filter_by(username=request.form['userneame']).first()
            hashed_password = user.password
            if request.form[hashed_password] == 'password':
                session['user'] = request.form['username']
                return redirect(url_for('auth.dashboard'))
           
        return render_template('dashboard.html' , session=session)
 
    @cache.cached(timeout=50, key_prefix='dashboard_data')
    @auth_bp.route('/dashboard')
    def dashboard():
        if g.user_tier == 'free':
            # Free user logic
                return render_template('dashboard.html', user=session['user'])
        elif g.user_tier == 'standard':
            # Standard user logic
            return render_template('dashboard.html', user=session['user'])

        elif g.user_tier == 'premium':
            # Premium user logic
            return render_template('dashboard.html', user=session['user'])

        elif g.user_tier == 'enterprise':
            # Enterprise user logic
            return render_template('dashboard.html', user=session['user'])

        else:
            # Handle unknown tier/ user maybe not registered and needs to go back to the index/registratiion page
            return redirect(url_for('index'))
     
    return configure_flask_app 
 
if __name__ == "__main__":
    
    # Access the environment indicator
    environment = configure_flask_app.config.get('ENVIRONMENT', 'development')
    print(f"Running in {environment} environment.")

    # Assuming 'your_dataset.csv' is the name of the dataset you want to upload
    dataset_name = 'your_dataset.csv'
    dataset_description = 'Description of your dataset'  # Provide an appropriate description

    # Call the upload_dataset() method to save the dataset
    saved_dataset = upload_dataset(name=dataset_name, description=dataset_description, file=None, url=None)

    # Check if the dataset was successfully saved
    if saved_dataset:
        dataset_path = saved_dataset.file_path  # Use the file_path attribute from the saved dataset
        your_data_frame = pd.read_csv(dataset_path)
        # Further processing or analysis with your_data_frame
        print(f"Dataset {saved_dataset.name} loaded successfully!")
    else:
        print("Failed to save dataset")# clean and transform the data
    
    # clean and transform the data
    transformed_data = clean_and_transform_data(load_and_process_data)  

    # run the data processing asynchronously
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(process_data_async(your_data_frame))

    #Display the transformed data
    print(result)

    #Run the Flask app in debug mode 
    create_app().run(debug=True)

