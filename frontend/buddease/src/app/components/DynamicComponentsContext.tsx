// DynamicComponentsContext.tsx
import React, { createContext, useContext, useState } from 'react';
interface DynamicConfigActionType {
  type: string; // Action type string
  payload?: any; // Payload type (can be any)
  
}

// Define a specific type or interface for dynamicConfig
interface DynamicConfigType {
  prop1: string;
  prop2: string;
  namingConventions: string[];
  RootLayout?: React.ComponentType<any>; // Optional RootLayout property
  chart?: {
    title?: string;
    // Add other properties as needed for the chart
  };
  nestedObject?: {
    nestedProperty?: any; // Update the type as per your requirement
    // Add other properties as needed for the nested object
  };
  // Add more properties as needed
}

type DynamicComponentContextProps = {
  children: React.ReactNode;
  dynamicConfig: DynamicConfigType;
  updateDynamicConfig: (newConfig: DynamicConfigType) => void; // Updated function signature
  setDynamicConfig: React.Dispatch<React.SetStateAction<any>>;
  setDynamicConfigAction: React.Dispatch<DynamicConfigActionType>; // Use DynamicConfigActionType interface
};  

type DynamicComponentsContextType = {
  dynamicConfig: DynamicConfigType;
  dynamicContent: boolean;
  updateDynamicConfig: (newConfig: DynamicConfigType) => void; // Updated function signature
  setDynamicConfig: React.Dispatch<React.SetStateAction<DynamicConfigType>>; 
  setDynamicConfigAction: React.Dispatch<DynamicConfigActionType>; // Use DynamicConfigActionType interface
  hooks: {
    componentSpecificData: any;
  }
  utilities: {
    componentSpecificData: any;
  }
  componentSpecificData: any;
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
  const [dynamicConfig, setDynamicConfig] = useState<DynamicConfigType>({
    prop1: "", prop2: "",
    namingConventions: []
  }); // Initialize with default values

  const updateDynamicConfig = (config: DynamicConfigType) => {
    setDynamicConfig(config);
  };

  const contextValue: DynamicComponentsContextType = {
    dynamicConfig,
    setDynamicConfig,
    updateDynamicConfig,
    setDynamicConfigAction: (value: DynamicConfigActionType) => { }, // Correct the function signature
    dynamicContent: false,
    hooks: {
      componentSpecificData: undefined
    },
    utilities: {
      componentSpecificData: undefined
    },
    componentSpecificData: undefined
  };

  return (
    <DynamicComponentsContext.Provider value={contextValue}>
      {children}
    </DynamicComponentsContext.Provider>
  );
};

export default DynamicConfigActionType;
export type { DynamicConfigType };
