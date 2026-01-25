mappers.ts
/app/server/repository/mappers.ts

import type { Attachment } from '@/core/documents/attachment/Attachment';
import { CacheData } from '@/core/generators/GenerateCache';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

AUTO-IMPORTS START
(auto-generated, do not edit)
AUTO-IMPORTS END

----------------------------
Import mapping interface
interface ImportMap {
  [alias: string]: string; // e.g., 'CacheData' -> '@/core/models/CacheData'
}

// Initial import map
let importMap: ImportMap = {
  CacheData: '@/core/models/CacheData',
  Attachment: '@/core/documents/attachment/Attachment',
  DefaultExcludedFields: '@/core/config/BaseConfig',
};

/**
 * Maps CacheData -> DB-friendly object
 * Strips out non-persistent fields (functions, hooks, etc.)
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

  for (const key in rest) {
    if (rest.hasOwnProperty(key) && !DefaultExcludedFields.includes(key as any)) {
      dbObj[key] = rest[key];
    }
  }

  return dbObj;
}

/**
 * Maps DB object -> CacheData
 */
export function fromDatabase<T extends CacheData>(dbObj: Record<string, any>): T {
  const cacheData: Partial<T> = { ...dbObj };

  // Ensure required top-level fields exist
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
 * Maps domain attachments -> DB attachments
 */
export function attachmentsToDatabase(attachments: Attachment[]): any[] {
  return attachments.map(att => ({
    id: att.id,
    type: att.type,
    url: att.url,
    metadata: att.metadata,
  }));
}

/**
 * Maps DB attachments -> domain attachments
 */
export function attachmentsFromDatabase(dbAttachments: any[]): Attachment[] {
  return dbAttachments.map(att => new Attachment(att.id, att.type, att.url, att.metadata));
}

/**
 * Map only specific fields for syncing
 */
export function mapForSync<T extends CacheData>(data: T, fields: (keyof T)[]): Partial<T> {
  const syncObj: Partial<T> = {};
  fields.forEach(field => {
    if (field in data) {
      syncObj[field] = data[field];
    }
  });
  return syncObj;
}

----------------------------
Auto-update import map logic
function updateImportMap(baseDir: string = path.resolve(__dirname, '../../..')): ImportMap {
  const updatedMap: ImportMap = {};

  for (const [alias, importPath] of Object.entries(importMap)) {
    const absPath = path.join(baseDir, importPath.replace(/^@\//, 'app/')) + '.ts';
    if (fs.existsSync(absPath)) {
      updatedMap[alias] = importPath;
    } else {
      const foundPath = findFileRecursively(baseDir, alias + '.ts');
      if (foundPath) {
        const relativePath = path.relative(baseDir, foundPath).replace(/\\/g, '/');
        updatedMap[alias] = '@/' + relativePath.replace(/\.ts$/, '');
      } else {
        console.warn(`⚠️ Could not locate module for alias "${alias}".`);
      }
    }
  }

  importMap = updatedMap;
  return importMap;
}

function findFileRecursively(dir: string, fileName: string): string | null {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item.startsWith('.') || item === 'node_modules' || item === 'dist') continue;

    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const result = findFileRecursively(fullPath, fileName);
      if (result) return result;
    } else if (item === fileName) {
      return fullPath;
    }
  }
  return null;
}

// User-specific database functions (keep these if you need them)
export function toDatabaseUser(user: UserCacheData) {
  return {
    _id: user.id,
    name: user.name,
    email: user.email,
    lastUpdated: new Date()
  };
}

export function fromDatabaseUser(dbObj: any): UserCacheData {
  return {
    id: dbObj._id,
    name: dbObj.name,
    email: dbObj.email
  };
}

// Run update on startup
updateImportMap();
console.log('✅ Import map updated:', importMap);