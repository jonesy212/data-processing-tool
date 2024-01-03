from datetime import datetime, timedelta

from flask_jwt_extended import JWTManager, decode_token

from blueprint_routes.auth.revoke_token import is_token_revoked

# Initialize the Flask-JWT-Extended extension
jwt = JWTManager()

# Helper function to decode and verify the token
def decode_and_verify_token(token):
    try:
        # Decode the token using Flask-JWT-Extended
        decoded_token = decode_token(token)
        
        # Add additional verification logic if needed
        # For example, check if the token has expired or if it has been revoked
        
        # Check if the token has expired
        current_time = datetime.utcnow()
        expiration_time = datetime.utcfromtimestamp(decoded_token['exp'])
        
        # Use timedelta to calculate the token's remaining validity
        token_validity = expiration_time - current_time

        if token_validity < timedelta(seconds=0):
            # Token has expired, handle accordingly (e.g., force reauthentication)
            return None
        
        # Check if the token has been revoked (example, if user logged out)
        # You would need to implement your own logic for token revocation
        if is_token_revoked(decoded_token):
            # Token has been revoked, handle accordingly
            return None
        
        # Return the user_id from the decoded token
        return decoded_token['identity']
    
    except Exception as e:
        # Handle any exceptions that may occur during decoding or verification
        # Return None if the token is invalid or any other error occurs
        return None

# Example of how to use decode_and_verify_token
if __name__ == '__main__':
    # Replace 'your_token_here' with an actual token for testing
    test_token = 'your_token_here'
    result = decode_and_verify_token(test_token)
    
    if result is not None:
        print(f"User ID: {result}")
    else:
        print("Token verification failed.")
