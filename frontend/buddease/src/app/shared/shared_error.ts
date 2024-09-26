// shared_error_handling.ts

// Import type declarations from the corresponding .d.ts file
import 'shared_error_handling';

export class NamingConventionsError extends Error {
 
  errorType: string; // Declare the errorType property

  constructor(errorType: string, details: string) {
    super(details);
    this.name = 'NamingConventionsError';
    this.errorType = errorType;
  }
}

// Export messages for the NamingConventionsError type
export const NamingConventionsErrorMessages = {
  DEFAULT: (errorType: any, details: any) => `Error: ${errorType} - ${details}`,
  INVALID_NAME_FORMAT: 'Invalid name format.',
  DUPLICATE_NAME: 'Duplicate name detected.',
  // Add more messages for the NamingConventionsError type if needed
};
