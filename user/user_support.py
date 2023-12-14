
from flask import flash, redirect, render_template, request, url_for

from configs.config import app
from database.mock_db.users_db import (generate_verification_code,
                                       send_verification_email, users_db)


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
