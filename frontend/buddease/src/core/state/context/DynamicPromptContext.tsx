// DynamicPromptContext.tsx
import { DynamicPromptHookParams, DynamicPromptHookResult } from "@/core/hooks/dynamicHooks/createDynamicPromptHook";
import createDynamicPromptHook from "@/core/prompts/DynamicPromptHookGenerator";
import type { ReactNode, createContext, useContext } from 'react';
import React from 'react';

type DynamicPromptContextType = {
  dynamicPromptHook: (
    params: DynamicPromptHookParams
  ) => DynamicPromptHookResult;
};

const DynamicPromptContext = createContext<
  DynamicPromptContextType | undefined
>(undefined);

type DynamicPromptProviderProps = {
  children: ReactNode;
};

export const DynamicPromptProvider: React.FC<DynamicPromptProviderProps> = ({
  children,
}) => {
  const dynamicPromptHook = createDynamicPromptHook

  return (
    <DynamicPromptContext.Provider
      value={{} as DynamicPromptContextType}
    >
      {children}
    </DynamicPromptContext.Provider>
  );
};

export const useDynamicPrompt = (): DynamicPromptContextType => {
  const context = useContext(DynamicPromptContext);
  if (!context) {
    throw new Error(
      "useDynamicPrompt must be used within a DynamicPromptProvider"
    );
  }
  return context;
};
export { DynamicPromptContext };
