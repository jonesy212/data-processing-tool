// securityHeaders.js

/**
 * Function to create security headers.
 * @returns {Record<string, string>} - The security headers.
 */
function createSecurityHeaders() {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'", // Adjust as needed
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Management': 'true',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()', // Adjust based on your needs
    'X-Permitted-Cross-Domain-Policies': 'none',
  };

  return headers;
}

export default createSecurityHeaders;