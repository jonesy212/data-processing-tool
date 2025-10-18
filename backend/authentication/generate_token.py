import secrets


def generate_token(length: int = 32) -> str:
    """
    Generate a random token with the specified length.
    
    Args:
        length (int): Length of the token. Default is 32.
    
    Returns:
        str: Random token.
    """
    # Generate a random token using secrets module
    token = secrets.token_hex(length // 2)  # Convert bytes to hex string
    return token

# Example usage:
# transfer_token = generate_token(64)  # Generate a 64-character transfer token
