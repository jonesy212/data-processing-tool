secureMappers.ts
secureMappers.ts
import type { DefaultExcludedFields } from '@/core/config/BaseConfig';

/** -------------------------
 * Core foundation fields
 * Explicitly visible for all entities
 * ------------------------- */
const CoreFields = [
  '_id',
  'lastUpdated',
  'dataVersions',
  'frontendStructure',
  'backendStructure',
  'frontendConfig',
  'backendConfig',
  'userSettings',
  'realtimeData',
] as const;

type CoreField = typeof CoreFields[number];

/** -------------------------
 * Sensitive fields
 * Should never be exposed publicly
 * ------------------------- */
const SensitiveFields = [
  'password',
  'authToken',
  'refreshToken',
  'privateKey',
  'ssn',
  'creditCard',
  'securityAnswer'
] as const;

type SensitiveField = typeof SensitiveFields[number];

/** -------------------------
 * Generic Mapper Utilities
 * ------------------------- */

/**
 * Maps entity -> DB object
 * Filters out excluded fields
 */
export function toDatabase<T extends Record<string, any>>(entity: T): Record<string, any> {
  const dbObj: Record<string, any> = {};

  // Keep foundation fields explicitly
  for (const key of CoreFields) {
    if (key in entity) dbObj[key] = entity[key];
  }

  // Copy other non-excluded and non-sensitive fields
  for (const key in entity) {
    if (
      entity.hasOwnProperty(key) &&
      !CoreFields.includes(key as CoreField) &&
      !DefaultExcludedFields.includes(key as any) &&
      !SensitiveFields.includes(key as SensitiveField)
    ) {
      dbObj[key] = entity[key];
    }
  }

  return dbObj;
}

/**
 * Maps DB object -> Cache entity
 * Ensures foundation fields exist
 */
export function fromDatabase<T extends Record<string, any>>(dbObj: Record<string, any>): T {
  const entity: Partial<T> = { ...dbObj };

  // Re-assign foundation fields explicitly
  for (const key of CoreFields) {
    entity[key] = dbObj[key];
  }

  return entity as T;
}

/**
 * Public mapper (API-safe)
 * Removes sensitive info
 */
export function toPublic<T extends Record<string, any>>(entity: T): Record<string, any> {
  const dbSafe = toDatabase(entity);

  for (const field of SensitiveFields) {
    if (field in dbSafe) delete dbSafe[field];
  }

  return dbSafe;
}

/**
 * Internal mapper (backend-safe)
 * Keeps sensitive fields intact
 */
export function toInternal<T extends Record<string, any>>(entity: T): Record<string, any> {
  return toDatabase(entity);
}

/** -------------------------
 * Entity-specific mappers
 * Example: User
 * ------------------------- */
export const UserMapper = {
  toDB: toInternal,
  fromDB: fromDatabase,
  toPublic,
};

/** Example: Version entity mapper */
export const VersionMapper = {
  toDB: toInternal,
  fromDB: fromDatabase,
  toPublic,
};

/** Example: Document entity mapper */
export const DocumentMapper = {
  toDB: toInternal,
  fromDB: fromDatabase,
  toPublic,
};
