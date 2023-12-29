from flask import Flask, jsonify

from logging_system.trackers.notification_tracker import NotificationTracker
from logging_system.trackers.phase_tracker import PhaseTracker
from logging_system.trackers.request_tracker import RequestTracker
from logging_system.trackers.team_tracker import TeamTracker
from logging_system.trackers.user_tracker import UserTracker

app = Flask(__name__)

notification_tracker = NotificationTracker()
team_tracker = TeamTracker()
user_tracker = UserTracker()
request_tracker = RequestTracker()
phase_tracker = PhaseTracker()

@app.route('/get_trackers', methods=['GET'])
def get_trackers():
    return jsonify({
        'team_count': team_tracker.team_count,
        'user_count': user_tracker.user_count
    })

if __name__ == '__main__':
    app.run(debug=True)
