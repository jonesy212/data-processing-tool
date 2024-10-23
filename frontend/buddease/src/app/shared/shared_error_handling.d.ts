// shared_error_handling.d.ts

declare module 'shared_error_handling' {
  export class NamingConventionsError extends Error {
    constructor(errorType: string, details: string);
  }

  // Type declaration for NamingConventionsError messages
  export const NamingConventionsErrorMessages: {
    DEFAULT: (errorType: any, details: any) => string;
    INVALID_NAME_FORMAT: string;
    DUPLICATE_NAME: string;
    // Add more messages for the NamingConventionsError type if needed
  };
}
