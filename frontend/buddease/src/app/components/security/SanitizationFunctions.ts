// SanitizationFunctions.ts

// Function to validate and sanitize user input (e.g., username, password)
export const sanitizeInput = (input: string): string => {
    // Implement validation and sanitization logic here
    // Example: Remove leading/trailing spaces, special characters, etc.
    return input.trim();
  };
  
  // Function to filter and sanitize user data (e.g., comments, messages)
// Function to filter and sanitize user data
export const sanitizeData = (data: string): string => {
    if (typeof data !== 'string') {
      throw new Error('Input must be a string');
    }
  
    // Regular expression to match and remove script tags
    const scriptTagRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  
    // Sanitize data by removing script tags
    const sanitizedData = data.replace(scriptTagRegex, '');
  
    return sanitizedData;
  };
  
  
  // Function to encode user data to prevent XSS attacks
export const encodeData = (data: string): string => {
    if (typeof data !== 'string') {
      throw new Error('Input must be a string');
    }
  
    // Regular expression to match special characters
    const specialCharsRegex = /[&<>"'/]/g;
  
    // Map of special characters to their corresponding HTML entities
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
  
    // Function to replace special characters with HTML entities
    const replaceSpecialChars = (char: string): string => {
      return htmlEntities[char];
    };
  
    // Encode data by replacing special characters with HTML entities
    const encodedData = data.replace(specialCharsRegex, replaceSpecialChars);
  
    return encodedData;
  };
  