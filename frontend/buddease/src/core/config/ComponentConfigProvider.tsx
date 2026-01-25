// ComponentConfigProvider.tsx
import type { ComponentsConfig } from '@/core/config/ComponentsConfig';
import type { defaultComponentConfig } from '@/core/config/ComponentsConfig';
import React, { createContext, useContext, useState } from "react";

type ConfigContextValue = {
  config: ComponentsConfig;
  setConfig: (c: Partial<ComponentsConfig>) => void;
  reset: () => void;
};

const ComponentConfigContext = createContext<ConfigContextValue | undefined>(undefined);

export const ComponentConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfigState] = useState<ComponentsConfig>(defaultComponentConfig);

  const setConfig = (partial: Partial<ComponentsConfig>) => {
    setConfigState(prev => ({ ...prev, ...partial }));
  };

  const reset = () => setConfigState(defaultComponentConfig);

  return (
    <ComponentConfigContext.Provider value={{ config, setConfig, reset }}>
      {children}
    </ComponentConfigContext.Provider>
  );
};

export const useComponentConfig = () => {
  const ctx = useContext(ComponentConfigContext);
  if (!ctx) throw new Error("useComponentConfig must be used within ComponentConfigProvider");
  return ctx;
};
