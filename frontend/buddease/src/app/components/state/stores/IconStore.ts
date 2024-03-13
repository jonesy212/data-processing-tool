import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux'; // Import useDispatch hook
import { rootStores } from './RootStores';
import generateStoreKey from './StoreKeyGenerator';

interface IconStoreProps {
  // Remove the unnecessary dispatch prop from props
}

export const IconStore: React.FC<IconStoreProps> = observer(() => {
  const [rootStore] = useState<typeof rootStores>();
  const dispatch = useDispatch(); // Initialize useDispatch hook

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
  }, [rootStore]); // Add rootStore to the dependencies array

  return null; // Adjust the return value based on your component structure
});

// Example usage in cache management
const storeKey = generateStoreKey('iconStore');
