// DynamicComponentsContext.tsx
import React, { createContext, useContext, useState } from 'react';

type DynamicComponentContextProps = {
  dynamicConfig: any;
  setDynamicConfig: React.Dispatch<React.SetStateAction<any>>;
  children: React.ReactNode;
};  

type DynamicComponentsContextType = {
  dynamicConfig: any;
  setDynamicConfig: React.Dispatch<React.SetStateAction<any>>;
};

const DynamicComponentsContext = createContext<DynamicComponentsContextType | undefined>(undefined);

export const useDynamicComponents = () => {
  const context = useContext(DynamicComponentsContext);
  if (!context) {
    throw new Error('useDynamicComponents must be used within a DynamicComponentsProvider');
  }
  return context;
};

export const DynamicComponentsProvider: React.FC<DynamicComponentContextProps> = ({ children }) => {
  const [dynamicConfig, setDynamicConfig] = useState({});

  const contextValue: DynamicComponentsContextType = {
    dynamicConfig,
    setDynamicConfig,
  };

  return (
    <DynamicComponentsContext.Provider value={contextValue}>
      {children}
    </DynamicComponentsContext.Provider>
  );
};
