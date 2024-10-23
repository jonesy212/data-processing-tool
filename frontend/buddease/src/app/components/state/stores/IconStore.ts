import { makeAutoObservable } from 'mobx';
import { RootStores } from './RootStores';
import { useAppDispatch } from './useAppDispatch';
import generateStoreKey from './StoreKeyGenerator';
import { useEffect } from 'react';

export interface IconStore {
  dispatch: (action: any) => void;
}

const useIconStore = (rootStore: RootStores): IconStore => {
  const dispatch = useAppDispatch(); // Use the custom hook to get dispatch function

  useEffect(() => {
    const iconLoader = async () => {
      try {
        // Simulate icon loading with a delay (replace with actual logic)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Dispatch an action to update the store once icons are loaded
        dispatch({ type: 'ICONS_LOADED', payload: { /* Add payload if needed */ } });
        
        // Trigger any necessary updates after loading
      } catch (error) {
        console.error('Error loading icons:', error);
        // Handle error loading icons
      }
    };

    iconLoader();
  }, [dispatch]); // Only dispatch is needed in the dependencies array

  // Generate store key
  const storeKey = generateStoreKey('iconStore');

  makeAutoObservable({
    dispatch,
  });

  return {
    dispatch,
  };
};

export default useIconStore;
