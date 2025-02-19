// cacheUtils.ts
import { create } from 'mobx-persist';
import { generateInterfaces } from '../generators/GenerateInterfaces';
import { readCache, writeCache } from './ReadAndWriteCache';
import { writeAndUpdateCache } from './CacheManager';

const backendModelPaths = ['path/to/backend/models']; // Update this with the actual path

// Generate interfaces
generateInterfaces(backendModelPaths);

// Read cache data
export const readAndLogCache = async () => {
  try {
    const cache = await readCache();
    console.log('Current Cache:', cache);
    return cache;
  } catch (error) {
    console.error('Error reading cache:', error);
    // Handle the error as needed, e.g., show a user-friendly message
    throw error;
  }
};

// Hydrate MobX store
export const hydrateMobXStore = (key: string, cache: any) => {
  create({
    storage: window.localStorage,
    jsonify: true,
  })(key, cache).rehydrate();
};

// Example usage
const exampleUsage = async () => {
  const key = 'your_store_key'; // Replace with your actual store key

  // Read cache data
  const cache = await readAndLogCache();

  // Update cache data
  if (cache) {
    const updatedCache = {
      ...cache,
      darkMode: true,
    };

    
    // Write the updated cache data
    await writeAndUpdateCache(updatedCache, newCacheData);

    // Hydrate the store
    hydrateMobXStore(key, cache);
  }
};

// Run the example usage
exampleUsage();
