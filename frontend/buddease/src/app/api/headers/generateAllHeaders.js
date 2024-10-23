/**
 * Function to create all necessary headers by combining custom, security, cache, and request headers.
 * @param {Object} options - Options for generating headers.
 * @param {string} authToken - The authentication token for the request.
 * @returns {Object} - The combined headers.
 */
function generateAllHeaders(options, authToken) {
  const customHeaders = generateCustomHeaders(options);
  const securityHeaders = createSecurityHeaders();
  const cacheHeaders = createCacheHeaders();
  const requestHeaders = createRequestHeaders(authToken);

  // Merge all the headers into one object
  const combinedHeaders = {
    ...customHeaders,
    ...securityHeaders,
    ...cacheHeaders,
    ...requestHeaders,
    // If additional options are provided, they can overwrite common values
    ...options.additionalHeaders,
  };

  return combinedHeaders;
}

export { generateAllHeaders };
