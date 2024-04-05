// DOMPurify.ts
import DOMPurify from 'dompurify';

// Function to sanitize HTML inputs using DOMPurify
const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html);
};
 
// Function to validate and sanitize user inputs
const validateAndSanitizeInput = (input: string): string => {
  // Perform validation (e.g., check for length, format, etc.)
  if (!input || input.trim() === '') {
    throw new Error('Input cannot be empty');
  }

  // Example: Validate input length
  if (input.length > 100) {
    throw new Error('Input length exceeds maximum limit');
  }

  // Example: Validate input format (e.g., email format)
  // Example: if (!isValidEmail(input)) {
  // Example:    throw new Error('Invalid email format');
  // Example: }

  // Sanitize input to prevent XSS attacks
  const sanitizedInput = sanitizeHTML(input);

  return sanitizedInput;
};

// Example usage:
try {
  const userInput = 'User input <script>alert("XSS attack")</script>';
  const sanitizedInput = validateAndSanitizeInput(userInput);
  console.log('Sanitized input:', sanitizedInput);
} catch (error: any) {
  console.error('Error:', error.message);
}

// Use validateAndSanitizeInput function to sanitize user inputs before using them in the application
