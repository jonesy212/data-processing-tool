
# app.py
import asyncio

import matplotlib.pyplot as plt
import pandas as pd
from flask import (Flask, g, jsonify, redirect, render_template, request,
                   session, url_for)
from flask_caching import Cache
from flask_cors import CORS
from flask_limiter import Limiter
from flask_login import login_required
from flask_migrate import Migrate

from api.app_context_helper import AppContextHelper
from authentication.auth import auth_bp
from blueprint_routes.blueprint_register import register_blueprints
from blueprint_routes.data_routes import data_bp
from blueprint_routes.register_routes import register
from configs.config import app as configure_flask_app
from configs.config import configure_app
from database.extensions import create_database, db
from dataprocessing.data_processing import load_and_process_data
from dataset.dataset_upload import upload_dataset
from hypothesis_testing.perform_hypothesis_test import perform_hypothesis_test
from logging_system.audit_logger import AuditingLogger
from logging_system.logger_config import setup_logging
from logging_system.warning_events import log_exception, log_warning
from models.user.get_remote_address import get_remote_address
from models.user.user import User
from preprocessing.clean_transformed_data import (clean_and_transform_data,
                                                  process_data_async)
from versioning.version import Version
from versioning.backup_directory import perform_backup, restore_backup
import time
# create gobao instance of AuditingLogger
auditor = AuditingLogger(log_file='auditing.log')
migrate = Migrate()


current_version = Version("1.0")  # Initialize with default version

def create_app(config_file=None):

    app = Flask(__name__)
    CORS(app)
    # Initialize the app context using AppContextHelper
    AppContextHelper.init_app_context(app)


    # Create the database
    create_database(app)

    # Error handler for unexpected errors
    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        log_exception(e)  # Log the exception
        log_warning(f"Unexpected error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500
    
    cache = Cache(app)
    setup_logging()
    if config_file:
        app.config.from_envvar(config_file)
    else:
        app.config.from_object('config.Config')  # Change to 'config.ProductionConfig' for production

    register_blueprints(app)
    configure_app(app)
    # Register blueprints

    db.init_db(app)
    migrate.init_app(app, db)
    limiter = Limiter(app, key_func=get_remote_address)

    # Set up rate limiting rules
    limiter.limit("5 per minute")(register)  # Limit the register route to 5 requests per minute


    @app.route('/api/version', methods=['GET'])
    def get_version():
        return jsonify({"version": current_version.getVersionNumber()})

   
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



@data_bp.route('/upload', methods=['POST'])
def upload_dataset():
    file = request.files['dataset']
    if file:
        # Process the uploaded dataset
        data = pd.read_csv(file)
        # Perform any processing using iloc or loc as needed
        
        # Example: Display the first 5 rows using iloc
        preview_data = data.iloc[:5, :]
        print("Preview of the uploaded dataset:")
        print(preview_data)
        
        # Save the dataset or perform other operations
        # ...

        return redirect(url_for('dashboard'))
    else:
        return "Error: No file provided for upload."


@data_bp.route('/hypothesis-test', methods=['POST'])
def run_hypothesis_test(dataset, test_type):
    test_type = request.form.get('test-type')
    if test_type:
        # Perform hypothesis test on the dataset
        # Use iloc or loc to select specific columns or rows based on user input
        num_rows = int(request.form.get('num_rows', 5))
        test_results = perform_hypothesis_test(dataset.iloc[:num_rows, :], test_type)
        print(f"Hypothesis Test Results ({test_type}):")
        print(test_results)

        # Visualize the results (you can use any plotting library)
        visualize_results(test_results)

        return redirect(url_for('dashboard'))
    else:
        return "Error: No hypothesis test selected."




# Function to visualize hypothesis test results
def visualize_results(results):
    # Example: Create a bar chart for t-test results
    plt.bar(['t_statistic', 'p_value'], [results['t_statistic'], results['p_value']])
    plt.title('T-Test Results')
    plt.xlabel('Test Statistic')
    plt.ylabel('P-Value')
    plt.savefig('static/t_test_results.png')  # Save the plot to a static file
    plt.close()

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


   # Configure and perform automated backup during application startup
    perform_backup()
    
    # Simulate a disaster scenario (e.g., database corruption)
    print("Simulating database corruption...")
    time.sleep(2)
    
    # Perform disaster recovery during application startup
    restore_backup()

    #Run the Flask app in debug mode 
    create_app().run(debug=True)

