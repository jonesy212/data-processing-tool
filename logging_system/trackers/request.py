from flask import Response, jsonify, request, Flask, render_template
from flask_socketio import SocketIO

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
    return send_message_to_frontend("Hello, world!")




# Define a route to handle AJAX requests and send messages to the frontend
@app.route('/get_messages', methods=['GET'])
def get_messages():
    messages = ["Message 1", "Message 2", "Message 3"]
    return jsonify(messages)


# Define a mechanism to send messages to the frontend
def send_message_to_frontend(message):
    # Implement your logic to send the message to the frontend
    pass

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
