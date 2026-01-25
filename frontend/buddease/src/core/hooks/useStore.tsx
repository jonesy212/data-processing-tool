// useStore.tsx
import { RootStores } from '@/core/state/stores/RootStores';
import { StoreContext } from '@/core/state/stores/StoreProvider';
import { useContext } from 'react';
// Define the useStore hook
export const useStore = (): RootStores => {
  const store = useContext(StoreContext);


  
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }

  return store;
};
