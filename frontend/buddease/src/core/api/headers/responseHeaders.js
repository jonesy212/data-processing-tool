// responseHeaders.js

/**
 * Function to parse response headers.
 * @param {Headers} headers - The response headers.
 * @returns {Object} - Parsed response headers.
 */
function parseResponseHeaders(headers) {
    const parsedHeaders = {};
  
    headers.forEach((value, key) => {
      parsedHeaders[key] = value;
    });
  
    return parsedHeaders;
  }
  
  export default parseResponseHeaders;
  