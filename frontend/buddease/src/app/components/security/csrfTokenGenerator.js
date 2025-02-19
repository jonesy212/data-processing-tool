// csrfTokenGenerator.js

const crypto = require('crypto');

// Function to generate a random CSRF token
export const generateCSRFToken = () => {
  // Generate a random buffer
  const buffer = crypto.randomBytes(32);
  // Convert buffer to a hexadecimal string
  const token = buffer.toString('hex');
  return token;
};


// Function to retrieve CSRF token from environment variable
const getCSRFToken = () => {
  // Retrieve CSRF token from environment variable
  const csrfToken = process.env.CSRF_TOKEN;
  // If CSRF token is not set, generate a new one
  if (!csrfToken) {
    // Generate a new CSRF token
    const newCSRFToken = generateCSRFToken();
    // Store the new CSRF token in the environment variable
    process.env.CSRF_TOKEN = newCSRFToken;
    // Return the new CSRF token
    return newCSRFToken;
  }
  // Return the existing CSRF token
  return csrfToken;
};

// Export the function to retrieve CSRF token
export default getCSRFToken; 
