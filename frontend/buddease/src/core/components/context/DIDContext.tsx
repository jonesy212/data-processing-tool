import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';

// Define the context type
interface DIDContextType {
  did: string;
  setDID: (did: string) => void;
}

// Create the context
export const DIDContext = createContext<DIDContextType | null>(null);

// Define props for the provider
interface DIDProviderProps {
  children: ReactNode;
}

// Define the provider component
export const DIDProvider: React.FC<DIDProviderProps> = ({ children }) => {
  const [did, setDID] = useState<string>('');

  return (
    <DIDContext.Provider value={{ did, setDID }}>
      {children}
    </DIDContext.Provider>
  );
};