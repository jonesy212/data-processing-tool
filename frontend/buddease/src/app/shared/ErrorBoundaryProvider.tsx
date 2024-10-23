import React, { createContext, ReactNode } from 'react';

// Define a specific type for the error handler
interface ErrorHandlerType {
  logError: (error: Error) => void;
  // Add other methods as necessary
}

interface ErrorBoundaryContextProps {
  ErrorHandler: ErrorHandlerType | null; // Use the defined type
}

export const ErrorBoundaryContext = createContext<ErrorBoundaryContextProps>({
  ErrorHandler: null,
});

interface ErrorBoundaryProviderProps {
  ErrorHandler: ErrorHandlerType | null; // Use the defined type
  children: ReactNode;
}

const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({ ErrorHandler, children }) => {
  return (
    <ErrorBoundaryContext.Provider value={{ ErrorHandler }}>
      {children}
    </ErrorBoundaryContext.Provider>
  );
};

export default ErrorBoundaryProvider;
