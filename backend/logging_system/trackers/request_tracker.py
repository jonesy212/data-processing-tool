from flask import Blueprint, g, request

tracker_bp = Blueprint('tracker_bp', __name__)

# Define a simple tracker class
class RequestTracker:
    def __init__(self):
        self.request_data = None

    def track_request_start(self):
        # Log or store information at the start of the request
        self.request_data = {
            'method': request.method,
            'path': request.path,
            'headers': dict(request.headers),
            # Add more information as needed
        }
        # You can log or store this data in a database, file, etc.

    def track_request_end(self, response):
        # Log or store information at the end of the request
        
        # For example, you can log the response status code
        if self.request_data:
            self.request_data['status_code'] = response.status_code
            # Log or store this data in a database, file, etc.
        return response

# Create an instance of the tracker
request_tracker = RequestTracker()

# Register before_request and after_request handlers
@tracker_bp.before_request
def before_request():
    request_tracker.track_request_start()

@tracker_bp.after_request
def after_request(response):
    return request_tracker.track_request_end(response)

# Sample route
@tracker_bp.route('/sample')
def sample_route():
    # Your route logic here
    return "Sample Route Response"
