import { useContext } from 'react';
import { RootStores } from '../state/stores/RootStores';
import { StoreContext } from '../state/stores/StoreProvider';
// Define the useStore hook
export const useStore = (): RootStores => {
  const store = useContext(StoreContext);


  
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }

  return store;
};
