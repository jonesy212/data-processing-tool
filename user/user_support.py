import random

from flask import flash, redirect, render_template, request, url_for
from flask_mail import Mail, Message

from configs.config import app, mail

# Mock user database (replace with actual database integration)
users_db = {}

# Function to generate a random verification code
def generate_verification_code():
    return str(random.randint(100000, 999999))

# Function to send verification code via email
def send_verification_email(email, code):
    subject = 'Verification Code for User Support'
    body = f'Your verification code is: {code}'
    message = Message(subject, recipients=[email], body=body)
    mail.send(message)

@app.route('/support', methods=['GET', 'POST'])
def support():
    if request.method == 'POST':
        # Handle user support request
        user_email = request.form.get('user_email')
        user_message = request.form.get('user_message')

        # Check if the user exists in the mock database
        if user_email in users_db:
            # Generate a verification code
            verification_code = generate_verification_code()

            # Store the verification code in the database (replace with actual database integration)
            users_db[user_email]['verification_code'] = verification_code

            # Send the verification code via email
            send_verification_email(user_email, verification_code)

            # Redirect to the verification page
            return redirect(url_for('verify_email', email=user_email))

        else:
            flash("Invalid user email. Please register or provide a valid email.")
    
    return render_template('user_support.html')

@app.route('/verify_email/<email>', methods=['GET', 'POST'])
def verify_email(email):
    if request.method == 'POST':
        entered_code = request.form.get('verification_code')

        # Check if the entered verification code matches the stored code
        stored_code = users_db[email].get('verification_code')
        if entered_code == stored_code:
            # Verification successful, process the support request
            return render_template('support_response.html', message="Your support request has been received.")
        else:
            flash("Invalid verification code. Please try again.")
    
    return redirect(url_for('auth.questionnaire'))

