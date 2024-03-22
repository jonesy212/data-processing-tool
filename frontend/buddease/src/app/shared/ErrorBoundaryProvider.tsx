// ErrorBoundaryProvider.tsx
import React, { createContext, ReactNode } from 'react';

interface ErrorBoundaryContextProps {
  ErrorHandler: any; // Type for the error handling utility
}

export const ErrorBoundaryContext = createContext<ErrorBoundaryContextProps>({
  ErrorHandler: null,
});

interface ErrorBoundaryProviderProps {
  ErrorHandler: any; // Type for the error handling utility
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
