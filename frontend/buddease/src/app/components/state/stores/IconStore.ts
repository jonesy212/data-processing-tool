import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { rootStores } from './RootStores'; // Update the import here
import generateStoreKey from './StoreKeyGenerator';

export const IconStore = observer(() => {
  const [rootStore] = useState<typeof rootStores>();  // Update the type here

  useEffect(() => {
    // Implement your logic to load icons here
    const iconLoader = async () => {
      // Your icon loading logic 
    };

    iconLoader().then(() => {
      // Trigger any necessary updates after loading

    });
  }, [rootStore]);

  return null; // Adjust the return value based on your component structure
});

// Example usage in cache management
const storeKey = generateStoreKey("iconStore");
