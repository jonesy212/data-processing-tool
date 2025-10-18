from datetime import datetime

from flask import Blueprint, g, request

tracker_bp = Blueprint('tracker_bp', __name__)


from datetime import datetime


class PhaseTracker:
    def __init__(self):
        self.phases = {}  # Use a dictionary to store phase details
    def create_phase(self, phase_name, start_date):
        # Generate a unique phase ID (you can use a more sophisticated method)
        phase_id = f"phase_{len(self.phases) + 1}"
        
        # Store phase details in the dictionary
        self.phases[phase_id] = {
            'phase_id': phase_id,
            'phase_name': phase_name,
            'start_date': start_date,
            'timestamp_start': datetime.utcnow(),

            'end_date': None,  # Initialize end_date as None
            'tasks': [],  # Initialize an empty list of tasks for the phase
            'discussions': []  # Initialize an empty list of discussions for the phase
            # Add additional fields as needed
        }
        return phase_id


    def track_phase_end(self):
        # Log or store information at the end of the phase
        if self.phase_data:
            self.phase_data['timestamp_end'] = datetime.utcnow()
            # Log or store this data in a database, file, etc.
       
       
    def end_phase(self, phase_id, end_date):
        # Check if the phase_id is valid
        if phase_id in self.phases:
            # Update the end_date of the phase
            self.phases[phase_id]['end_date'] = end_date
            return True
        else:
            return False  # Invalid phase_id

    def add_task_to_phase(self, phase_id, task_details):
        # Check if the phase_id is valid
        if phase_id in self.phases:
            # Add the task to the phase's list of tasks
            self.phases[phase_id]['tasks'].append(task_details)
            return True
        else:
            return False  # Invalid phase_id

    def add_discussion_to_phase(self, phase_id, discussion_details):
        # Check if the phase_id is valid
        if phase_id in self.phases:
            # Add the discussion to the phase's list of discussions
            self.phases[phase_id]['discussions'].append(discussion_details)
            return True
        else:
            return False  # Invalid phase_id

    def get_phase_details(self, phase_id):
        # Return details of a specific phase
        return self.phases.get(phase_id, None)

    def get_all_phases(self):
        # Return details of all phases
        return list(self.phases.values())







# Create an instance of the PhaseTracker
phase_tracker = PhaseTracker()

# Sample usage in a route
@tracker_bp.route('/start-phase/<phase_name>')
def start_phase(phase_name):
    phase_tracker.track_phase_start(phase_name)
    return f"Started {phase_name} Phase"

@tracker_bp.route('/end-phase')
def end_phase():
    phase_tracker.track_phase_end()
    return "Ended Phase"













