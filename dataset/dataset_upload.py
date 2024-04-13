import os

import httpx  # Import the httpx library
import pandas as pd
from flask import Flask, redirect, render_template, request, session, url_for
from flask_jwt_extended import current_identity, jwt_required
from flask_login import current_user
from werkzeug.utils import secure_filename

from authentication.auth import auth_bp
from configs.config import app, db
from data_analysis import analyze_data
from models.dataset import DatasetModel
from preprocessing.tokenize_text import predictive_analytics


def allowed_file(file_format):
    return file_format.lower() in app.config['ALLOWED_FORMATS']

def allowed_format(file_format):
    allowed_formats = ['csv', 'xls', 'xlsx', 'json']
    return file_format.lower() in allowed_formats


def save_dataset(file, url, name, description):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
    elif url:
        # You might want to add validation for the URL
        file_path = url
    else:
        if not allowed_format(file.filename):
            return None


    new_dataset = DatasetModel(name=name, description=description, file_path=file_path)
    db.session.add(new_dataset)
    db.session.commit()

    return new_dataset


def convert_file(file_path, output_format):
    if output_format == 'csv':
        data = pd.read_excel(file_path) if file_path.endswith('.xlsx') else pd.read_json(file_path)
        output_file_path = file_path.replace(os.path.splitext(file_path)[1], '.csv')
        data.to_csv(output_file_path, index=False)

    elif output_format == 'xlsx':
        data = pd.read_csv(file_path) if file_path.endswith('.csv') else pd.read_json(file_path)
        output_file_path = file_path.replace(os.path.splitext(file_path)[1], '.xlsx')
        data.to_excel(output_file_path, index=False)

    elif output_format == 'json':
        data = pd.read_csv(file_path) if file_path.endswith('.csv') else pd.read_excel(file_path)
        output_file_path = file_path.replace(os.path.splitext(file_path)[1], '.json')
        data.to_json(output_file_path, orient='records')
@auth_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_dataset():
    client = httpx.Client()

    file_format = secure_filename(request.files['file'].filename).split('.')[-1]
    # Check if the current user has remaining quota
    if current_user.is_authenticated and current_user.has_quota() > 0:
        # Perform the upload
        # Decrement user's upload quota
        current_identity['upload_quota'] -= 1
        db.session.commit()

        # Continue with the rest of the code
        name = request.form.get('name')
        description = request.form.get('description')
        file = request.files.get('file')
        url = request.form.get('url')

        if not file and not url:
            return render_template('upload.html', message="No file or URL provided")

        # Check if the dataset was successfully saved
        saved_dataset, save_error = save_dataset(file, url, name, description)

        # Ensure saved_dataset is used
        if saved_dataset is None:
            return f"Failed to save the dataset: {save_error}"

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            # Check if a file with the same name already exists
            if os.path.exists(file_path):
                return f"A file with the same name already exists. Please choose a different name or consider updating the existing file."

            # Use client to send the file
            with client as http_client:
                response = http_client.post('http://example.com/upload', files={'file': file.read()})

                # Check if the upload was successful
                if response.status_code == 200:
                    file.save(file_path)
                else:
                    return f"Failed to upload file: {response.text}"

        elif url:
            # You might want to add validation for the URL
            file_path = url
        else:
            if not allowed_format(file.filename):
                return "Unsupported file format."

        new_dataset = DatasetModel(name=name, description=description, file_path=file_path)
        db.session.add(new_dataset)
        db.session.commit()

        # Store the file path in the session
        session['file_path'] = file_path

        # Load the dataset into loaded_data and handle potential errors
        loaded_data, error_message = load_dataset(file_path, file_format)

        # Check if the dataset loaded successfully
        if loaded_data is not None:
            # Display or process the loaded data
            app.logger.info(f"Dataset loaded successfully: {loaded_data.head()}")
            
            # Perform further processing or analysis as needed
            
            # Example: Perform predictive analytics
            accuracy = predictive_analytics(loaded_data)
            print("Predictive Analytics Accuracy:", accuracy)
        else:
            # Log the error message and handle the error gracefully
            app.logger.error(f"Error loading dataset: {error_message}")

        # Load the dataset into your_data_frame
        your_data_frame, error_message = load_dataset(file_path)

        if your_data_frame is not None:
            # Display or process the loaded data
            app.logger.info(f"Dataset loaded successfully: {your_data_frame.head()}")
        else:
            # Log the error message
            app.logger.error(f"Error loading dataset: {error_message}")

        # Check if the user selected an output format
        output_format = request.form.get('output_format')
        if output_format:
            converted_file_path = convert_file(file_path, output_format)
            return f"File converted and saved at: {converted_file_path}"

        # Add code to handle the uploaded dataset
        return redirect(url_for('user_dashboard'))
    else:
        return 'You have reached your quota limit for the month. You can upgrade or purchase more credits.'


# Your existing Flask route for saving data analysis
@app.route('/save_data_analysis', methods=['POST'])
def save_data_analysis():
    file = request.files['file']
    name = request.form['name']
    description = request.form['description']

    # Implement the logic to save data analysis to the database
    # You may need to create a DataAnalysis Model and add it to the database
    # Return the saved data analysis object

# Your existing Flask route for processing data analysis
@app.route('/process_data_analysis', methods=['POST'])
def process_data_analysis():
    # Retrieve the file path from the request
    file = request.files['file']

    try:
        # Load the data from the file
        if file.filename == '':
            return 'No selected file'

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(file.filename))
        file.save(file_path)

        # Perform the analysis on the loaded data
        data = pd.read_csv(file_path)  # Assuming the file is in CSV format
        # Perform your analysis here
        analysis_result = analyze_data(data)

        # Optionally, store the analysis results or return them
        return f"Analysis result: {analysis_result}"

    except Exception as e:
        # Handle any exceptions that occur during the process
        return f"Error processing data analysis: {str(e)}"
 
    
@auth_bp.route('/upload-data-analysis', methods=['POST'])
@jwt_required()
def upload_data_analysis():
    try:
        # Check if the current user has remaining quota
        if current_user.is_authenticated and current_user.has_quota() > 0:
            # Perform the upload
            # Decrement user's upload quota
            current_identity['upload_quota'] -= 1
            db.session.commit()

            # Continue with the rest of the code
            name = request.form.get('name')
            description = request.form.get('description')
            file = request.files.get('file')

            # Check if the data analysis was successfully saved
            saved_data_analysis = save_data_analysis(file, name, description)

            if file.filename == '':
                return 'No selected file'

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)

                # Store the file path in the session
                session['file_path'] = file_path

                # Process the uploaded data analysis
                process_data_analysis(file_path)

                # Add code to handle the uploaded data analysis
                return redirect(url_for('data_analysis_dashboard'))
            else:
                # Handle invalid file format
                return render_template("upload.html", message="File format not supported")
        else:
            return 'You have reached your quota limit for the month. You can upgrade or purchase more credits.'

    except Exception as e:
        # Handle other exceptions as needed
        return f"Error: {str(e)}"




def load_dataset(file_path):
    # Determine the file format based on the extension
    file_format = os.path.splitext(file_path)[1].lower()

    # Load the dataset based on the file format
    try:
        if file_format == 'csv':
            data = pd.read_csv(file_path)
        elif file_format in ["xls", "xlsx"]:
            data = pd.read_excel(file_path)
        elif file_format == "json":
            data = pd.read_json(file_path)
        else:
            return None, f"Unsupported file format: {file_format}"

        # Optionally, you can add more checks for specific file formats
        # For example, check if the loaded DataFrame has the expected columns, etc.

        return data, None  # Return the loaded data and no error message

    except FileNotFoundError:
        return None, "File not found. Please provide a valid file path."
    except pd.errors.EmptyDataError:
        return None, "The file is empty."
    except pd.errors.ParserError:
        return None, "Error parsing the file. Please check the file format."


file_path = session.get('file_path')
loaded_data, error_message = load_dataset(file_path)

if loaded_data is not None:
    # Display the loaded data
    print(loaded_data.head())
else:
    # Display the error message
    print(f"Error: {error_message}")
