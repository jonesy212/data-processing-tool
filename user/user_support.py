# user_support.py
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/support', methods=['GET', 'POST'])
def support():
    if request.method == 'POST':
        # Handle user support request
        user_message = request.form.get('user_message')
        # Process the user's support request
        return render_template('support_response.html', message="Your support request has been received.")
    
    return render_template('user_support.html')

if __name__ == '__main__':
    app.run()
