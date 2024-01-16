// storeProvider.tsx

import React, { createContext, useContext } from 'react';
import { RootStores, rootStores } from './RootStores';
export const StoreContext = createContext<RootStores | undefined>(undefined);

interface StoreProviderProp {
  children: React.ReactNode;
}
export const StoreProvider: React.FC<StoreProviderProp> = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStores}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): RootStores => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
