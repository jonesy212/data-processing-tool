
# app.py
import asyncio

import pandas as pd
from flask import (Flask, g, redirect, render_template, request, session,
                   url_for)
from flask_login import login_required
from flask_migrate import Migrate

from authentication.auth import auth_bp
from config import app as config_app
from database.extensions import db
from dataprocessing.data_processing import load_and_process_data
from dataset.dataset_upload import upload_dataset
from preprocessing.clean_transformed_data import (clean_and_transform_data,
                                                  process_data_async)
from preprocessing.upload_data import load_data

migrate = Migrate()
def create_app():
    
    app = Flask(__name__)
    app.config.from_object(config_app.config)
    
    db.init_db(app)
    migrate.init_app(app, db)
    #  todo add jwt Include the authentication blueprint
    app.register_blueprint(auth_bp)

    #todo verify if index or login is used since the userr is being directed back to login anyway 
    @app.route('/', methods=['GET', 'POST'])
    def index():
        if request.method == 'POST':
            session.pop('user', None)
            
            if request.form['password'] == 'password':
                session['user'] = request.form['username']
                return redirect[url_for('protected')]
            
        return render_template('home.html', session=session)   
  
    @app.route('/home')
    @login_required
    def home():
        #g global variable 
        if g.user:
            return render_template('home.html', user=session['user'])
        return redirect(url_for('index'))
    
    # middleware
    @app.before_request
    def before_request():
        g.user = None
        
    if 'user'in session:
        g.user = session['user']

    app.route('/dropdsession')
    def dropdsession():
        session.pop('user', None)
        return render_template('login.html')
    
    return config_app 
 
if __name__ == "__main__":
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
        transformed_data = clean_and_transform_data(load_and_process_data)  

    # run the data processing asynchronously
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(process_data_async(your_data_frame))

    #Display the transformed data
    print(result)

    #Run the Flask app asnchronously in debug mode 
    asyncio.run(create_app().run(debug=True))

