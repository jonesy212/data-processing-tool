# blueprint_routes/nlp_routes.py
# Import any necessary libraries/modules
import spacy
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

# Load the spaCy model for NLP processing
nlp = spacy.load('en_core_web_sm')


nlp_bp = Blueprint('nlp_bp', __name__)


@nlp_bp.route('/process-task-description', methods=['POST'])
@jwt_required()
def process_task_description():
    try:
        data = request.get_json()
        task_description = data.get('task_description')

        # Example NLP processing logic for task descriptions using spaCy
        doc = nlp(task_description)

        # Extract relevant information from the task description
        keywords = []

        # Identify keywords based on named entities
        for ent in doc.ents:
            keywords.append({
                'text': ent.text,
                'label': ent.label_
            })

        # Extract verbs and nouns
        verbs = [token.text for token in doc if token.pos_ == 'VERB']
        nouns = [token.text for token in doc if token.pos_ == 'NOUN']

        result = {
            'keywords': keywords,
            'verbs': verbs,
            'nouns': nouns,
            'message': 'Task description processed successfully with authentication'
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500












@nlp_bp.route('/generate-task-prompt', methods=['POST'])
@jwt_required()
def generate_task_prompt():
    try:
        data = request.get_json()
        task_name = data.get('task_name')
        due_date = data.get('due_date')
        assigned_team = data.get('assigned_team')

        # Example NLP processing logic to generate a prompt for a new task
        prompt = f"Create a new task named '{task_name}' with a due date of {due_date} assigned to the team {assigned_team}."

        result = {
            'prompt': prompt,
            'message': 'Task prompt generated successfully with authentication'
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500














@nlp_bp.route('/analyze-project-progress', methods=['GET'])
@jwt_required()
def analyze_project_progress():
    try:
        # Example NLP analysis logic for project progress with authentication
        # Assume you have project-related data available in your system
        project_data = get_project_data()  # You need to implement this function

        # Perform some analysis on project data (Example: Calculate completion percentage)
        completion_percentage = calculate_completion_percentage(project_data)

        result = {
            'completion_percentage': completion_percentage,
            'message': 'Project progress analyzed successfully with authentication'
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_project_data():
    # Implement logic to retrieve project data from your database or other sources
    # Example: Fetch project tasks, deadlines, and completion status
    project_data = {
        'tasks': [...],  # List of tasks in the project
        'deadlines': [...],  # List of deadlines for tasks
        'completion_status': {...}  # Dictionary with task IDs and completion status
        # Add more project-related data as needed
    }
    return project_data

def calculate_completion_percentage(project_data):
    # Implement logic to calculate project completion percentage
    total_tasks = len(project_data['tasks'])
    completed_tasks = sum(1 for task_id, status in project_data['completion_status'].items() if status == 'completed')

    # Ensure no division by zero
    completion_percentage = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0

    return completion_percentage












@nlp_bp.route('/process-text', methods=['POST'])
def process_text():
    try:
        data = request.get_json()
        text_to_process = data.get('text')

        # Process the text using spaCy or your NLP library of choice
        doc = nlp(text_to_process)

        # Extract relevant information
        task_name = None
        due_date = None
        assigned_team = None

        for token in doc:
            # Example: Identify task name based on capitalized words
            if token.is_title and not task_name:
                task_name = token.text

            # Example: Identify due date based on date entities
            if token.ent_type_ == 'DATE' and not due_date:
                due_date = token.text

            # Example: Identify assigned team based on organizational entities
            if token.ent_type_ == 'ORG' and not assigned_team:
                assigned_team = token.text

        result = {
            'task_name': task_name,
            'due_date': due_date,
            'assigned_team': assigned_team
        }

        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500












@nlp_bp.route('/extract-task-entities', methods=['POST'])
def extract_task_entities():
    """
    NLP entity extraction for tasks.
    """
    try:
        # Get the input text from the request
        input_text = request.json.get('text')

        # Perform NLP processing using spaCy
        doc = nlp(input_text)

        # Extract relevant entities
        task_entities = {
            'task_names': [],
            'due_dates': [],
            'assigned_team_members': []
        }

        for ent in doc.ents:
            if ent.label_ == 'TASK_NAME':
                task_entities['task_names'].append(ent.text)
            elif ent.label_ == 'DUE_DATE':
                task_entities['due_dates'].append(ent.text)
            elif ent.label_ == 'TEAM_MEMBER':
                task_entities['assigned_team_members'].append(ent.text)

        # You can add more entity types and customize the extraction logic as needed

        return jsonify({'task_entities': task_entities}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
