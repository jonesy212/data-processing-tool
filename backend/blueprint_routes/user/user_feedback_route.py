# user_feedback.py
from flask import flash, redirect, render_template, request, url_for

from blueprint_routes.user.user_feedback_route import UserFeedback
from configs.config import app
from database.extensions import db


@app.route('/feedback', methods=['GET', 'POST'])
def feedback():
    if request.method == 'POST':
        try:
            user_feedback_text = request.form.get('user_feedback')

            # Validate user input
            if not user_feedback_text:
                raise ValueError("User feedback is empty.")

            # Process the user's feedback
            process_user_feedback(user_feedback_text)

            flash("Thank you for your feedback!", 'success')
            return redirect(url_for('feedback_response'))
        except Exception as e:
            app.logger.error(f"Error processing user feedback: {str(e)}")
            flash("An error occurred while processing your feedback. Please try again later.", 'error')

    return render_template('user_feedback.html')

@app.route('/feedback/response')
def feedback_response():
    return render_template('feedback_response.html')

def process_user_feedback(feedback_text):
    try:
        # Save the user's feedback to the database
        user_feedback = UserFeedback(feedback_text=feedback_text)
        db.session.add(user_feedback)
        db.session.commit()
    except Exception as e:
        app.logger.error(f"Error saving user feedback to the database: {str(e)}")
        raise  # Re-raise the exception for proper error handling
