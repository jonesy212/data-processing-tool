//Client-side cache utils /utils/cache/clientCacheUtils.ts):

import { writeAndUpdateCache } from '@/core/server/CacheManager';
import { readCache, writeCache } from '@/utils/ReadAndWriteCache';
import { create } from 'mobx-persist';

// Read cache data
export const readAndLogCache = async (userId: string) => {
  try {
    const cache = await readCache(userId.toString());
    console.log('Current Cache:', cache);
    return cache;
  } catch (error) {
    console.error('Error reading cache:', error);
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

// Update cache with writeCache
export const updateCacheData = async (userId: string, updates: any) => {
  try {
    const currentCache = await readCache(userId.toString());
    const updatedCache = {
      ...currentCache,
      ...updates,
    };
    
    // Write using both methods
    await writeCache(userId.toString(), updatedCache);
    await writeAndUpdateCache(updatedCache, updates);
    
    return updatedCache;
  } catch (error) {
    console.error('Error updating cache:', error);
    throw error;
  }
};

// Example usage with React component
export const useCacheOperations = () => {
  const userId = useSecureUserId(); // This hook is client-side only
  
  const exampleUsage = async (key: string) => {
    // Read cache data
    const cache = await readAndLogCache(userId);
    
    if (cache) {
      // Update cache data using writeCache
      const updatedCache = await updateCacheData(userId, { darkMode: true });
      
      // Hydrate the store
      hydrateMobXStore(key, cache);
      
      return updatedCache;
    }
  };
  
  return { exampleUsage };
};