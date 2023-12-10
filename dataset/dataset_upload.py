import os
from urllib.parse import urlparse

import pandas as pd
# dataset_upload.py
from flask import Flask, redirect, render_template, request, session, url_for
from flask_jwt_extended import current_identity, jwt_required
from flask_login import current_user
from werkzeug.utils import secure_filename

from authentication.auth import auth_bp
from configs.config import app, db
from models.dataset import DatasetModel


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1] in app.config['ALLOWED_EXTENSIONS']


def save_dataset(file, url, name, description):
    if file and allowed_file(file.filename):
        filename = filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
    elif url:
        # You might waant to add validaation for the URL
        file_path = url
    else:
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
    #check if the current user has remaining quota
    if current_user.is_authenticated and current_user.has_quota() > 0:
        #perform the upload
        # Decrement users upload quota
        current_identity['upload_quota'] -= 1
        db.session.commit()
        return "Dataset uploaaded successfully"
    else: 'You have reached your quota limit for the month.  You can upgrade or purchase more credits.'
    name = request.form.get('name')
    description = request.form.get('description')
    file = request.files.get('file')
    url = request.form.get('url')

    if not file and not url:
        return render_template('upload.html', message="No file or URL provided")

    # Check if the dataset was successfully saved
    saved_dataset = save_dataset(file, url, name, description)

    if file.filename == '':
        return 'No selected file'

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Store the file path in the session
        session['file_path'] = file_path

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
        # Handle invalid file format
        return render_template("upload.html", message="File format not supported")







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


if __name__ == '__main__':
    app.run()
