// UIContext.ts
// stores/StoreProvider.tsx
import * as React from 'react';
import { createContext, ReactNode, useContext } from 'react';
import UIStore from '../components/state/stores/UIStore';
import { displayToast } from '../components/models/display/ShowToast';
 

interface StoreProviderProps {
  children: ReactNode;
}

const UIStoreContext = createContext<UIStore | undefined>(undefined);

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const uiStore = new UIStore(displayToast); 
  return (
    <UIStoreContext.Provider value={uiStore}>
      {children}
    </UIStoreContext.Provider>
  );
};

export const useUIStore = (): UIStore => {
  const context = useContext(UIStoreContext);
  if (context === undefined) {
    throw new Error('useUIStore must be used within a StoreProvider');
  }
  return context;
};
