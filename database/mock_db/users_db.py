import random

from flask_mail import Message

from configs.config import app
from database.Mail import mail

# Mock user database (replace with actual database integration)
users_db = {}

# Function to generate a random verification code
def generate_verification_code():
    return str(random.randint(100000, 999999))

# Function to send verification code via email
def send_verification_email(email, code, attachments=None):
    subject = 'Verification Code for User Support'
    body = f'Your verification code is: {code}'
    message = Message(subject, recipients=[email], body=body, attachments=None)
    # Add attachments if provided
    if attachments:
        for attachment in attachments:
            with app.open_resource(attachment['file_path']) as file:
                message.attach(attachment['filename'], attachment['content_type'], file.read())

    mail.send(message)
    
    # # Example usage with an image attachment
    # attachments = [{'file_path': 'path/to/image.jpg', 'filename': 'image.jpg', 'content_type': 'image/jpeg'}]
    # send_verification_email(user_email, verification_code, attachments)
   