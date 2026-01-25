from flask import Flask, Response, jsonify, redirect, request, url_for
from flask_socketio import SocketIO

from blueprint_routes.notifications.notification_routes import notification_bp
from database.extensions import db
from models.regulations.regulatory_requirement import RegulatoryRequirement
from flask_mail import Message

app = Flask(__name__)
socketio = SocketIO(app)

@socketio.on('message')
def handle_message(message):
    print('Received message:', message)

# Define a function to send messages to the frontend
def send_message_to_frontend(message):
    socketio.emit('notification', message)

if __name__ == '__main__':
    socketio.run(app)




# Define a function to send messages to the frontend
def send_message_to_frontend(message):
    def generate():
        yield f"data: {message}\n\n"
    return Response(generate(), mimetype='text/event-stream')

@app.route('/')
def index():
    requirements = RegulatoryRequirement.query.all()
    return send_message_to_frontend("Hello, world!",  requirements=requirements)


@app.route('/add_requirement', methods=['POST'])
def add_requirement():
    # Get data from form submission
    country_or_region = request.form['country_or_region']
    gdpr_compliant = request.form.get('gdpr_compliant', 'No')
    ccpa_compliant = request.form.get('ccpa_compliant', 'No')
    hipaa_compliant = request.form.get('hipaa_compliant', 'No')
    
    # Create a new RegulatoryRequirement instance
    requirement = RegulatoryRequirement(country_or_region=country_or_region,
                                        gdpr_compliant=gdpr_compliant,
                                        ccpa_compliant=ccpa_compliant,
                                        hipaa_compliant=hipaa_compliant)
    
    # Add the new requirement to the database
    db.session.add(requirement)
    db.session.commit()
    
    return redirect(url_for('index'))



# Define a route to handle AJAX requests and send messages to the frontend
@app.route('/get_messages', methods=['GET'])

def get_messages():
    # Retrieve messages from the database
    messages = Message.query.all()
    
    # Extract message texts from Message objects
    message_texts = [message.text for message in messages]
    
    return jsonify(message_texts)

# Define a mechanism to send messages to the frontend using Server-Sent Events (SSE)
def send_message_to_frontend(message):
    def generate():
        yield f"data: {message}\n\n"
    return Response(generate(), mimetype='text/event-stream')


# Intercept requests to blueprints
@app.before_request
def before_blueprint_request():
    # Identify requests to blueprints by inspecting the request URL
    blueprint_names = ['auth_bp', 'notification_bp', 'company_bp']  # Add other blueprint names as needed
    if any(bp in request.path for bp in blueprint_names):
        # Trigger message to frontend indicating access to a blueprint
        send_message_to_frontend("Access to a blueprint detected.")

# Intercept responses to blueprints
@app.after_request
def after_blueprint_request(response):
    # Identify responses from blueprints if needed
    # Implement logic to send messages to frontend based on response data
    return response

# Example route in a blueprint
@notification_bp.route('/notifications', methods=['GET'])
def get_notifications():
    # Your logic to fetch notifications
    notifications = [{'id': 1, 'message': 'Notification 1'}, {'id': 2, 'message': 'Notification 2'}]
    return jsonify(notifications)

# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True)
