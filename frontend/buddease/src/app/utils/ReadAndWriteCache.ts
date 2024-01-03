import { CacheData } from "../generators/GenerateCache";

// Function to read cache data
export const readCache = async (): Promise<CacheData> => {
  try {
    // Simulate fetching data from a server
    const response = await fetch('/api/get_cache_data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reading cache:', error);
    throw error;
  }
};

// Function to write cache data
export const writeCache = async (newCacheData: CacheData) => {
  try {
    // Simulate updating data on the server
    const response = await fetch('/api/update_cache', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newCacheData }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Error writing cache:', error);
    throw error;
  }
};
