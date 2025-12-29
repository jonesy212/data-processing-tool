// entityMapper.ts
// server/repository/mappers/userMapper.ts

import { DefaultExcludedFields } from '@/core/config/BaseConfig';
import { CacheData } from '@/core/generators/GenerateCache'; // adjust import as needed

/**
 * Maps User CacheData -> DB-friendly object
 * Keeps essential fields and removes functions/hooks/etc.
 */
export function userToDatabase<T extends CacheData>(user: T): Record<string, any> {
  const {
    _id,
    lastUpdated,
    dataVersions,
    frontendStructure,
    backendStructure,
    frontendConfig,
    backendConfig,
    userSettings,
    realtimeData,
    ...rest
  } = user;

  const dbObj: Record<string, any> = {
    _id,
    lastUpdated,
    dataVersions,
    frontendStructure,
    backendStructure,
    frontendConfig,
    backendConfig,
    userSettings,
    realtimeData,
  };

  // Copy other fields except excluded
  for (const key in rest) {
    if (rest.hasOwnProperty(key) && !DefaultExcludedFields.includes(key as any)) {
      dbObj[key] = rest[key];
    }
  }

  return dbObj;
}

/**
 * Maps DB object -> User CacheData
 */
export function userFromDatabase<T extends CacheData>(dbObj: Record<string, any>): T {
  const cacheUser: Partial<T> = { ...dbObj };

  // Ensure required top-level fields exist
  cacheUser._id = dbObj._id;
  cacheUser.lastUpdated = dbObj.lastUpdated;
  cacheUser.dataVersions = dbObj.dataVersions;
  cacheUser.frontendStructure = dbObj.frontendStructure;
  cacheUser.backendStructure = dbObj.backendStructure;
  cacheUser.frontendConfig = dbObj.frontendConfig;
  cacheUser.backendConfig = dbObj.backendConfig;
  cacheUser.userSettings = dbObj.userSettings;
  cacheUser.realtimeData = dbObj.realtimeData;

  return cacheUser as T;
}
