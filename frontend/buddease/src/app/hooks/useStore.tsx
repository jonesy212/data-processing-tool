import { useContext } from 'react';
import { RootStores } from '@/app/state/stores/RootStores';
import { StoreContext } from '@/app/state/stores/StoreProvider';
// Define the useStore hook
export const useStore = (): RootStores => {
  const store = useContext(StoreContext);


  
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }

  return store;
};
