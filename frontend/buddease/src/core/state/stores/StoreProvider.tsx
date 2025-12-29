// StoreProvider.tsx
// storeProvider.tsx

import { RootStores, rootStores } from '@/core/state/stores/RootStores';
import React, { createContext, useContext } from 'react';

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
