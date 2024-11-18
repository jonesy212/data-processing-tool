// requestHeaders.js

/**
 * Function to create request headers.
 * @param {string} authToken - The authentication token.
 * @returns {Record<string, string>} - The request headers.
 */
function createRequestHeaders(authToken) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Content-Management': 'true',
      // Add other common request headers here
    };
  
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
  
    return headers;
  }
  
  export default createRequestHeaders;
  