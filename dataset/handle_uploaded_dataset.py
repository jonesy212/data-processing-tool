# handle_uploaded_dataset
import pandas as pd
from flask import session

from database.init_db import init_db
from models.dataset import DatasetModel
from script_commands.celery_module import Celery

# todo connect datasetModel

celery = Celery(__name__)

@celery.task
def perform_analysis(data):
    # Your analysis code here
    result = data.describe() # todo replace with your analysis
    return result


# your_models_module import DatasetModel
def handle_uploaded_dataset(file_path):
    data = pd.read_csv(file_path)
    
    #assume datamode is your SQAchemy model
    perform_analysis.delay(data)
    for index, row in data.iterrows():
        init_db.session.add(DatasetModel(**row.to_dict()))
    init_db.session.commit()