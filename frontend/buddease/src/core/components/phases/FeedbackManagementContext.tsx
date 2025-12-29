// FeedbackManagementContext.tsx
import React, { createContext, useContext } from 'react';

// Define the context
const FeedbackManagementContext = createContext<any>(null);

// Custom hook to consume the context
export const useFeedbackManagement = () => useContext(FeedbackManagementContext);

// Provider component to wrap the component tree and provide the context value
export const FeedbackManagementProvider: React.FC<{
  value: any;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <FeedbackManagementContext.Provider value={value}>
    {children}
  </FeedbackManagementContext.Provider>
);
