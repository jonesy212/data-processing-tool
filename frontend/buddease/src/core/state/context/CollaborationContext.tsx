// CollaborationContext.tsx
import React from'react';
import { createContext, useContext, useState } from 'react';

// Define the collaboration context
interface CollaborationContextType {
  collaborationState: any; // Define the type according to your collaboration state
  setCollaborationState: React.Dispatch<React.SetStateAction<any>>;
}

// Create the collaboration context
const CollaborationContext = createContext<CollaborationContextType>({
  collaborationState: null,
  setCollaborationState: () => {},
});

// Define the collaboration provider
export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [collaborationState, setCollaborationState] = useState<any>(null); // Initialize with appropriate initial state

  return (
    <CollaborationContext.Provider
      value={{ collaborationState, setCollaborationState }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};

// Define the useCollaboration hook to access the collaboration context
export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};
