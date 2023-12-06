import os
from urllib.parse import urlparse

import pandas as pd
# dataset_upload.py
from flask import Flask, redirect, render_template, request, session, url_for
from werkzeug.utils import secure_filename

from config import app, db
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
        
@app.route('/upload', methods=['POST'])



def upload_dataset():
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
   
if __name__ == '__main__':
    app.run()
