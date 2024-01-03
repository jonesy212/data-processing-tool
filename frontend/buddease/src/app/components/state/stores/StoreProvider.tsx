// storeProvider.tsx

import React, { createContext, useContext } from 'react';
import { RootStore, rootStore } from './RootStores';

export const StoreContext = createContext<RootStore | undefined>(undefined);

interface StoreProviderProp {
  children: React.ReactNode;
}
export const StoreProvider: React.FC<StoreProviderProp> = ({ children }) => {
  return (
    <StoreContext.Provider value={rootStore}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = (): RootStore => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
