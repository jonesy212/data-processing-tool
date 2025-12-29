// proxyHeaders.js

/**
 * Function to parse proxy headers.
 * @param {Headers} headers - The proxy headers.
 * @returns {Object} - Parsed proxy headers.
 */
function parseProxyHeaders(headers) {
    const parsedHeaders = {};
  
    headers.forEach((value, key) => {
      parsedHeaders[key] = value;
    });
  
    return parsedHeaders;
  }
  
  export default parseProxyHeaders;
  