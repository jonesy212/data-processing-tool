from database.extensions import db
from models.security.token_owner import TokenOwner


def get_token_owner(token_jti):
    try:
        # Replace this with your actual database query logic
        token_owner = TokenOwner.query.filter_by(token_jti=token_jti).first()

        if token_owner:
            return token_owner.user_id
        else:
            # Handle the case where the token_jti is not found in the database
            return None

    except Exception as e:
        # Log the error or handle it based on your application needs
        print(f"Error in get_token_owner: {str(e)}")
        return None


# Full use case with edge cases
def test_get_token_owner():
    # Edge case: Token not found in the database
    non_existing_token_jti = 'non_existing_token'
    assert get_token_owner(non_existing_token_jti) is None

    # Edge case: Token found in the database
    existing_token_jti = 'existing_token'
    # Assuming you have a user with 'user123' as the user_id associated with the existing token
    token_owner = TokenOwner(user_id='user123', token_jti=existing_token_jti)
    db.session.add(token_owner)
    db.session.commit()

    assert get_token_owner(existing_token_jti) == 'user123'

    # Clean up: Remove the test data from the database
    TokenOwner.query.filter_by(token_jti=existing_token_jti).delete()
    db.session.commit()

# Run the test function
test_get_token_owner()
