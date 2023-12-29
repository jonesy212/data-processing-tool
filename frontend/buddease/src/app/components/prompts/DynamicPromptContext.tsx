// DynamicPromptContext.tsx
import React, { ReactNode, createContext, useContext } from 'react';
import createDynamicPromptHook, { DynamicPromptHookParams, DynamicPromptHookResult } from './DynamicPromptHookGenerator';

type DynamicPromptContextType = {
  dynamicPromptHook: (params: DynamicPromptHookParams) => DynamicPromptHookResult;
};

const DynamicPromptContext = createContext<DynamicPromptContextType | undefined>(undefined);

type DynamicPromptProviderProps = {
  children: ReactNode;
};

export const DynamicPromptProvider: React.FC<DynamicPromptProviderProps> = ({
  children,
}) => {
  const dynamicPromptHook = createDynamicPromptHook({
    condition: () => true,
    asyncEffect: async () => {
      console.log("Dynamic prompt generated!");
    },
      cleanup: () => {
          // add cleanup logic here
          
      console.log("Cleanup for dynamic prompt");
    },
  });

  return (
    <DynamicPromptContext.Provider value={{ dynamicPromptHook }}>
      {children}
    </DynamicPromptContext.Provider>
  );
};

export const useDynamicPrompt = (): DynamicPromptContextType => {
  const context = useContext(DynamicPromptContext);
  if (!context) {
    throw new Error('useDynamicPrompt must be used within a DynamicPromptProvider');
  }
  return context;
};