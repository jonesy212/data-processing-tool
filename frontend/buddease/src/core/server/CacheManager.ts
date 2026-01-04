CacheManager.ts
lib/server/CacheManager.ts
'use server';

import { promises as fs } from 'fs';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');

Ensure cache directory exists
const ensureCacheDir = async () => {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
};

export const readServerCache = async (key: string): Promise<any> => {
  await ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `${key}.json`);
  
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return null;
  }
};

export const writeServerCache = async (key: string, data: any): Promise<void> => {
  await ensureCacheDir();
  const filePath = path.join(CACHE_DIR, `${key}.json`);
  
  try {
    await fs.writeFile(filePath, JSON.stringify(data), 'utf8');
  } catch (error) {
    console.error('Error writing to server cache:', error);
    throw error;
  }
};



export const writeAndUpdateCache = async (key: string, newCacheData: any): Promise<void> => {
  try {
    const filePath = getBackendStructureFilePath(key);
    
    // Write to server cache file
    await writeServerCache(filePath, newCacheData);
    
    console.log(`Server cache updated for ${key} at path: ${filePath}`);
  } catch (error: any) {
    console.error("Error writing server cache:", error);
    throw error;
  }
};