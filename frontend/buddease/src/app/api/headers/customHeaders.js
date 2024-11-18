// customHeaders.js

/**
 * Function to generate custom headers for API requests.
 * @param {Object} options - Header options.
 * @returns {Record<string, string>} - Custom headers object.
 */
function generateCustomHeaders(options) {
    const { apiKey, token } = options;
  
    // Common headers
    const headers = {
      'Content-Type': 'application/json',
      'X-Content-Management': 'true',
      Accept: 'application/json',
      // Add any other common headers here
    };
  
    // Authorization header
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  
    // API Key header
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
  
    // Custom headers specific to your application
    // Add any additional headers here
  
    return headers;
  }
  
  export default generateCustomHeaders;
  