userMapper.ts
import type { DefaultExcludedFields } from '@/core/config/BaseConfig';
import { CacheData } from '@/core/generators/GenerateCache';

Explicit sensitive fields that should never be exposed
const SensitiveUserFields = [
  'password',
  'authToken',
  'refreshToken',
  'privateKey',
  'ssn',
  'creditCard',
  'securityAnswer'
] as const;

type SensitiveField = typeof SensitiveUserFields[number];

/**
 * Maps CacheData -> DB-friendly object
 * Removes non-persistent and sensitive fields
 */
export function toDatabase<T extends CacheData>(data: T): Record<string, any> {
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
  } = data;

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

  // Copy other fields that are not excluded or sensitive
  for (const key in rest) {
    if (
      rest.hasOwnProperty(key) &&
      !DefaultExcludedFields.includes(key as any) &&
      !SensitiveUserFields.includes(key as SensitiveField)
    ) {
      dbObj[key] = rest[key];
    }
  }

  return dbObj;
}

/**
 * Maps DB object -> CacheData
 * Reconstructs cache object safely
 */
export function fromDatabase<T extends CacheData>(dbObj: Record<string, any>): T {
  const cacheData: Partial<T> = { ...dbObj };

  // Explicitly set required fields
  cacheData._id = dbObj._id;
  cacheData.lastUpdated = dbObj.lastUpdated;
  cacheData.dataVersions = dbObj.dataVersions;
  cacheData.frontendStructure = dbObj.frontendStructure;
  cacheData.backendStructure = dbObj.backendStructure;
  cacheData.frontendConfig = dbObj.frontendConfig;
  cacheData.backendConfig = dbObj.backendConfig;
  cacheData.userSettings = dbObj.userSettings;
  cacheData.realtimeData = dbObj.realtimeData;

  return cacheData as T;
}

/**
 * Public mapper for API responses
 * Removes sensitive fields so frontend cannot access them
 */
export function toPublic<T extends CacheData>(data: T): Record<string, any> {
  const dbSafe = toDatabase(data);

  // Remove any remaining sensitive fields
  SensitiveUserFields.forEach((field) => {
    if (field in dbSafe) {
      delete dbSafe[field];
    }
  });

  return dbSafe;
}

/**
 * Internal mapper for backend use
 * Keeps sensitive fields intact if needed for internal operations
 */
export function toInternal<T extends CacheData>(data: T): Record<string, any> {
  return toDatabase(data);
}
