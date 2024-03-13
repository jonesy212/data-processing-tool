// contentHeaders.js

/**
 * Function to create content headers.
 * @returns {Object} - The content headers.
 */
function createContentHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'X-Content-Management': 'true',
      // Add other default headers here if needed
    };
  
    return headers;
  }
  
  export default createContentHeaders;
  