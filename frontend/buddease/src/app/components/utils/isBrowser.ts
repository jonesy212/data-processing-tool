// utils/isBrowser.ts

/**
 * Utility to check if the code is running in a browser environment.
 * @returns {boolean} - Returns true if in a browser environment, false if in a server (Node.js) environment.
 */
export const isBrowser = (): boolean => {
    // Check for the presence of 'window' and 'document', which are typically available in browsers
    return typeof window !== 'undefined' && typeof document !== 'undefined' && typeof navigator !== 'undefined';
  };