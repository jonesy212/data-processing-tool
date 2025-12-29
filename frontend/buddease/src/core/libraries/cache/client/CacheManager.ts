// CacheManager.ts
//client/CacheManager.ts
'use client';

import { CacheWriteOptions } from '@/core/libraries/cache/client/index';
import axios from "axios";
import { create } from "mobx-persist";

// Client-side storage implementation
const getStorage = () => {
  if (typeof window === 'undefined') return null;
  return localStorage;
};

export const readClientCache = async (key: string): Promise<any> => {
  if (typeof window === 'undefined') return null;
  
  const storage = getStorage();
  if (!storage) return null;
  
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from client cache:', error);
    return null;
  }
};

export const writeClientCache = async (key: string, data: any): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  const storage = getStorage();
  if (!storage) return;
  
  try {
    storage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error writing to client cache:', error);
  }
};





export const writeAndUpdateCache = async (key: string, newCacheData: any, options: CacheWriteOptions = {}): Promise<void> => {
  const { persistToServer = false } = options;
  
  try {
    // Write to client cache
    await writeClientCache(key, newCacheData);
    
    // Optionally persist to server
    if (persistToServer) {
      await fetch('/api/cache', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, data: newCacheData }),
      });
    }
    
    // Show success notification
    await notify(
      'write-cache-success',
      `Cache Write Successful`,
      `Cache was successfully updated for ${key}`,
      new Date(),
      'success' as NotificationType
    );
  } catch (error: any) {
    console.error("Error writing cache:", error);
    
    // Show error notification
    await notify(
      'write-cache-failure',
      `Cache Write Failed`,
      `Failed to write cache for ${key}: ${error.message}`,
      new Date(),
      'CacheError' as NotificationType
    );
    
    throw error;
  }
};


export class CacheManager {
  static async read(key: string): Promise<any> {
    // Try client cache first
    const clientData = await readClientCache(key);
    if (clientData) return clientData;
    
    // If not found on client, try server (for SSR/SSG)
    try {
      const response = await fetch(`/api/cache/${key}`);
      if (response.ok) {
        const serverData = await response.json();
        // Cache it on client for future use
        if (serverData) await writeClientCache(key, serverData);
        return serverData;
      }
    } catch (error) {
      console.error('Error fetching from server cache:', error);
    }
    
    return null;
  }
  
  static async write(key: string, data: any, options: CacheWriteOptions = {}): Promise<void> {
    const { persistToServer = false } = options;
    
    // Always write to client cache
    await writeClientCache(key, data);
    
    // Optionally persist to server
    if (persistToServer) {
      try {
        await fetch('/api/cache', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ key, data }),
        });
      } catch (error) {
        console.error('Error writing to server cache:', error);
      }
    }
  }
}

// Client-side only cache operations
export const readClientCache = async (key: string): Promise<any> => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading client cache for key ${key}:`, error);
    return null;
  }
};

export const writeClientCache = async (key: string, data: any): Promise<void> => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`Client cache written for key: ${key}`);
  } catch (error) {
    console.error(`Error writing client cache for key ${key}:`, error);
    throw error;
  }
};

export const hydrateMobXStore = (key: string, cache: any) => {
  create({
    storage: window.localStorage,
    jsonify: true,
  })(key, cache).rehydrate();
};

export const synchronizeCacheWithServer = async (key: string, data: any) => {
  try {
    await axios.post(`/api/cache/${key}`, { data });
  } catch (error) {
    console.error(`Error synchronizing ${key} cache with the server:`, error);
  }
};