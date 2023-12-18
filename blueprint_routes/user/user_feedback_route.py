# user_feedback.py
from flask import render_template, request

from blueprint_routes.user.user_feedback_route import \
    UserFeedback  # Import the UserFeedback model
from configs.config import app
from database.extensions import db


@app.route('/feedback', methods=['GET', 'POST'])
def feedback():
    if request.method == 'POST':
        # Handle user feedback
        user_feedback_text = request.form.get('user_feedback')

        # Process the user's feedback
        process_user_feedback(user_feedback_text)

        return render_template('feedback_response.html', message="Thank you for your feedback!")

    return render_template('user_feedback.html')

def process_user_feedback(feedback_text):
    # Save the user's feedback to the database
    user_feedback = UserFeedback(feedback_text=feedback_text)
    db.session.add(user_feedback)
    db.session.commit()
