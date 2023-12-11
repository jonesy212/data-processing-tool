# user_feedback.py
from flask import render_template, request

from configs.config import app


@app.route('/feedback', methods=['GET', 'POST'])
def feedback():
    if request.method == 'POST':
        # Handle user feedback
        user_feedback = request.form.get('user_feedback')
        # Process the user's feedback
        return render_template('feedback_response.html', message="Thank you for your feedback!")
    
    return render_template('user_feedback.html')
