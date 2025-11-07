// server/repository/versionMapper.ts

import { VersionEntityDataInterface } from '@/app/typings/entities/VersionEntity';
import { DefaultExcludedFields } from '@/app/config/BaseConfig';


/**
 * Maps VersionEntity -> DB-friendly object
 */
export const versionToDatabase = (version: VersionEntityDataInterface): Record<string, any> => {
  // Use the internal mapper to preserve fields for DB storage
  return VersionMapper.toDB(version);
};

/**
 * Maps DB object -> VersionEntity
 */
export const versionFromDatabase = (dbObj: Record<string, any>): VersionEntityDataInterface => {
  return VersionMapper.fromDB(dbObj);
};

/**
 * Maps VersionEntity -> Public-facing object
 * (removes sensitive fields if any)
 */
export const versionToPublic = (version: VersionEntityDataInterface): Record<string, any> => {
  return VersionMapper.toPublic(version);
};


/**
 * Maps VersionEntity -> DB-friendly object
 * Preserves essential fields, strips runtime-only fields
 */
export function versionToDatabase(version: VersionEntityDataInterface): Record<string, any> {
  const {
    id,
    createdAt,
    updatedAt,
    versionNumber,
    versionTag,
    parentVersionId,
    childVersions,
    context,
    name,
    description,
    category,
    tags,
    isActive,
    metadata,
    backend,
    frontend,
    history,
    attachments,
    ...rest
  } = version;

  const dbObj: Record<string, any> = {
    id,
    createdAt,
    updatedAt,
    versionNumber,
    versionTag,
    parentVersionId,
    childVersions,
    context,
    name,
    description,
    category,
    tags,
    isActive,
    metadata,
    backend,
    frontend,
    history,
    attachments,
  };

  // Copy other fields except runtime/excluded ones
  for (const key in rest) {
    if (rest.hasOwnProperty(key) && !DefaultExcludedFields.includes(key as any)) {
      dbObj[key] = rest[key];
    }
  }

  return dbObj;
}

/**
 * Maps DB object -> VersionEntity
 * Ensures essential fields exist
 */
export function versionFromDatabase(dbObj: Record<string, any>): VersionEntityDataInterface {
  const version: Partial<VersionEntityDataInterface> = { ...dbObj };

  version.id = dbObj.id;
  version.createdAt = dbObj.createdAt;
  version.updatedAt = dbObj.updatedAt;
  version.versionNumber = dbObj.versionNumber;
  version.versionTag = dbObj.versionTag;
  version.parentVersionId = dbObj.parentVersionId;
  version.childVersions = dbObj.childVersions;
  version.context = dbObj.context;
  version.name = dbObj.name;
  version.description = dbObj.description;
  version.category = dbObj.category;
  version.tags = dbObj.tags;
  version.isActive = dbObj.isActive;
  version.metadata = dbObj.metadata;
  version.backend = dbObj.backend;
  version.frontend = dbObj.frontend;
  version.history = dbObj.history;
  version.attachments = dbObj.attachments;

  return version as VersionEntityDataInterface;
}
