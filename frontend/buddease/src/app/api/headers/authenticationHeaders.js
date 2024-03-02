// authenticationHeaders.js

// Function to create authentication headers
const createAuthenticationHeaders = (token, userId) => {
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-User-ID': userId, // Add user ID if available
        'X-App-Version': '1.0.0', // Add application version
        // Add more authentication headers if needed
      };
    } else {
      return {
        'Content-Type': 'application/json',
        'X-App-Version': '1.0.0', // Add application version
        // Add default headers if no token is provided
      };
    }
};

export default createAuthenticationHeaders;
