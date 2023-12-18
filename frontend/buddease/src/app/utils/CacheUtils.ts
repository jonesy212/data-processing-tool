// cacheUtils.ts
import { create } from 'mobx-persist';
import { generateInterfaces } from '../generators/GenerateInterfaces';
import { readCache, writeCache } from './ReadAndWriteCache';

const backendModelPaths = ['path/to/backend/models']; // Update this with the actual path

// Generate interfaces
generateInterfaces(backendModelPaths);

// Read cache data
export const readAndLogCache = async () => {
  const cache = await readCache();
  console.log('Current Cache:', cache);
  return cache;
};

// Write cache data
export const writeAndUpdateCache = async (newCacheData: any) => {
  await writeCache(newCacheData);
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
    await writeAndUpdateCache(updatedCache);
  }

  // Hydrate the store
  hydrateMobXStore(key, cache);
};

// Run the example usage
exampleUsage();
