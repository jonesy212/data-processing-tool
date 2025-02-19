// store_key_generator.ts

// Function to generate a unique store key
const generateStoreKey = (storeName: string): string => {
    // Your logic to generate a unique key, for example:
    const uniqueIdentifier = Math.random().toString(36).substring(2, 15);
    return `${storeName}_${uniqueIdentifier}`;
  };
  
  export default generateStoreKey;

  


  // Example usage in cache management
// import generateStoreKey from './store_key_generator';

const storeName = 'YourStore';
const storeKey = generateStoreKey(storeName);

// Now, storeKey is a unique identifier for 'YourStore'
