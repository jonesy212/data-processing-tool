import { useContext } from 'react';
import { RootStore } from '../state/stores/RootStores';
import { StoreContext } from '../state/stores/StoreProvider';
// Define the useStore hook
export const useStore = (): RootStore => {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }

  return store;
};
