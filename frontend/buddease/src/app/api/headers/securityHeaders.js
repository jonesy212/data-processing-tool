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
      'Content-Security-Policy': "default-src 'self'",
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Management': 'true',
      

      // Add other security-related headers here if needed
    };
  
    return headers;
  }
  
  export default createSecurityHeaders;
  