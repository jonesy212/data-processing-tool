/**
 * Function to create cache headers.
 * @returns {Object} - The cache headers.
 */
function createCacheHeaders() {
  const headers = {
    'Cache-Control': 'no-cache',
    // Add other cache-related headers here if needed
  };

  return headers;
}

export default createCacheHeaders;
