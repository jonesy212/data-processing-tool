# tasks_module.py

from preprocessing.clean_transformed_data import clean_and_transform_data
from script_commands.celery_module import celery


@celery.task
def process_data_task(data, options):
    #
    return clean_and_transform_data(data, options)


