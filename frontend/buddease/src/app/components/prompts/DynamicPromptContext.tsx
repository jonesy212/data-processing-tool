// DynamicPromptContext.tsx
import React, { ReactNode, createContext, useContext } from "react";
import createDynamicPromptHook, {
  DynamicPromptHookParams,
  DynamicPromptHookResult,
} from "./DynamicPromptHookGenerator";

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
  const dynamicPromptHook = createDynamicPromptHook({
    condition: () => true,
    asyncEffect: async () => {
      console.log("Dynamic prompt generated!");
    },
    cleanup: () => {
      console.log("Cleanup for dynamic prompt");
    },
    // Add the missing property resetIdleTimeout with its implementation
    resetIdleTimeout: () => {
      // Implement the logic for resetIdleTimeout if needed
      console.log("Resetting idle timeout");
    },
    isActive: false, // Assuming isActive is a boolean property in DynamicPromptHookResult
  });

  return (
    <DynamicPromptContext.Provider
      value={{
        dynamicPromptHook,
      }}
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
