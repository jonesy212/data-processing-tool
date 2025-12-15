// UIContext.tsx
// UIContext.ts
// stores/StoreProvider.tsx
import { displayToast } from '@/app/components/models/display/ShowToast';
import UIStore from '@/app/state/stores/UIStore';
import * as React from 'react';
import { createContext, ReactNode, useContext } from 'react';
 

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
