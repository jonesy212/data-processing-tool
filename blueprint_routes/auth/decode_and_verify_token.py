from flask_jwt_extended import decode_token


# Helper function to decode and verify the token
def decode_and_verify_token(token):
    try:
        # Decode the token using Flask-JWT-Extended
        decoded_token = decode_token(token)
        
        # Add additional verification logic if needed
        # For example, check if the token has expired or if it has been revoked
        
        # Return the user_id from the decoded token
        return decoded_token['identity']
    
    except Exception as e:
        # Handle any exceptions that may occur during decoding or verification
        # Return None if the token is invalid or any other error occurs
        return None
