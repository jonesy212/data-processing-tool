# models.py
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class DataAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    result = db.Column(db.Text)  # Assuming 'result' is a field you want to include
    description = db.Column(db.Text)
    file_path = db.Column(db.String(255))

    def __init__(self, id, name, result, description, file_path):
        self.id = id
        self.name = name
        self.result = result
        self.description = description
        self.file_path = file_path

    def __repr__(self):
        return f"<DataAnalysis(id={self.id}, name={self.name}, result={self.result}, description={self.description}, file_path={self.file_path})>"
