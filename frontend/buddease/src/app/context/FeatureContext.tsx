import React, { ReactNode, createContext, useContext } from "react";
import FeatureStore from "../components/state/stores/FeatureStore";
// Define the interface for the feature context value
interface FeatureContextValue {
  featureStore: FeatureStore;
}

// Define the context for features
const FeatureContext = createContext<FeatureContextValue | null>(null);

// Custom hook to use the feature context
export const useFeatureContext = () => {
  const context = useContext(FeatureContext);
  if (!context) {
    throw new Error("useFeatureContext must be used within a FeatureProvider");
  }
  return context;
};

// Feature provider component
interface FeatureProviderProps {
  children: ReactNode;
}
export const FeatureProvider = ({ children }: FeatureProviderProps) => {
  const featureStore = new FeatureStore();

  const contextValue: FeatureContextValue = {
    featureStore: featureStore,
  };

  return (
    <FeatureContext.Provider value={contextValue}>
      {children}
    </FeatureContext.Provider>
  );
};
