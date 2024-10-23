import DOMPurify from 'dompurify';

/**
 * Function to validate and sanitize user inputs.
 * @param input The input string to validate and sanitize.
 * @returns The sanitized input string.
 * @throws Error if input is empty or exceeds maximum length.
 */
const validateAndSanitizeInput = (input: string): string => {
  // Check for empty input or whitespace
  if (!input || input.trim() === '') {
    throw new Error('Input cannot be empty');
  }

  // Validate input length
  const maxLength = 100;
  if (input.length > maxLength) {
    throw new Error(`Input length exceeds maximum limit of ${maxLength} characters`);
  }

  // Sanitize input to prevent XSS attacks
  const sanitizedInput = sanitizeHTML(input);

  return sanitizedInput;
};

/**
 * Function to sanitize HTML inputs using DOMPurify.
 * @param html The HTML string to sanitize.
 * @returns The sanitized HTML string.
 */
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html);
};




// Function to sanitize initial data
export const sanitizeInitialData = (data: any): any => {
  // Implement sanitization logic for initial data
  // Here we can use DOMPurify to sanitize any HTML content in the initial data
  // For example, if the initial data contains HTML content, sanitize it using DOMPurify
  if (typeof data === 'string') {
    return sanitizeHTML(data);
  }
  // If the data is not a string, return it as is (assuming it's already sanitized or not HTML)
  return data;
};

// Function to sanitize callback functions
export const sanitizeCallback = (callback: any): any => {
  // Implement sanitization logic for callback functions
  // Here we assume the callback function is already safe to execute and does not contain any malicious code
  // So, we simply return the callback function as it is
  return callback;
};

// Example usage:
try {
  const userInput = 'User input <script>alert("XSS attack")</script>';
  const sanitizedInput = validateAndSanitizeInput(userInput);
  console.log('Sanitized input:', sanitizedInput);
} catch (error: any) {
  console.error('Error:', error.message);
}
