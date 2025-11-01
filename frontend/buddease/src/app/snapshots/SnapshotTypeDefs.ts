// SnapshotTypeDefs.ts
import { ExtractEntityTypes } from '@/app/typings/BaseTypes';


import { 
  BaseDataEntity, 
  DefaultExcludedFields, 
  DefaultMeta 
} from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import {
    SnapshotsArray, 
  SnapshotsObject,
    Snapshots
} from '@/app/snapshots/LocalStorageSnapshotStore'
import {  SnapshotBase } from '@/app/snapshots/SnapshotContainer'; // Your existing file

import SnapshotStore from '@/app/snapshots/SnapshotStore'
import { SnapshotConfig as ExistingSnapshotConfig } from '@/app/snapshots/SnapshotConfig'
import { isSnapshotsArray } from '@/app/snapshots/createSnapshotStoreOptions'

// Utility types that maintain 6 parameters
export type SnapshotTypeName = 'array' | 'object' | 'store' | 'union';

export type GetSnapshotType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
  Name extends SnapshotTypeName = SnapshotTypeName
> = 
  Name extends 'array' ? SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> :
  Name extends 'object' ? SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> :
  Name extends 'store' ? SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> :
  Name extends 'union' ? SnapshotUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> :
  never;

// Type extractor for your 6-parameter system
export type ExtractSnapshotParams<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
  SnapshotType extends Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
> = {
  T: T;
  K: K;
  Meta: Meta;
  AttachmentType: AttachmentType;
  ExcludedFields: ExcludedFields;
  IncludedFields: IncludedFields;
  SnapshotType: SnapshotType;
};

// Type constructor for your 6-parameter system
export type CreateSnapshotType<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = {
  snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotArray: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotObject: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotBase: SnapshotBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotConfig: ExistingSnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

// SnapshotUnion definition with 6 parameters
export type SnapshotUnion<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = 
  | SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[number]
  | SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[string];


export const isSnapshotsObject = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  obj: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): obj is SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  return !Array.isArray(obj) && typeof obj === 'object';
};

// Safe conversion utilities with 6 parameters
export const snapshotsToArray = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  if (isSnapshotsArray(snapshots)) {
    return snapshots;
  }
  
  // For object type, convert to array
  const obj = snapshots as SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  const result: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = [];
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result.push(obj[key]);
    }
  }
  
  return result;
};

export const snapshotsToObject = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshots: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  if (isSnapshotsObject(snapshots)) return snapshots;
  
  return snapshots.reduce((acc, snapshot, index) => {
    const key = (snapshot as any).id?.toString() || index.toString();
    acc[key] = snapshot as any;
    return acc;
  }, {} as SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>);
};


// Export convenience types for your entities
export type TaskSnapshotTypes = ExtractEntityTypes<import('@/app/typings/entities/TaskEntity').TaskEntity>;
export type ProjectSnapshotTypes = ExtractEntityTypes<import('@/app/typings/entities/ProjectEntity').ProjectEntity>;
export type UserSnapshotTypes = ExtractEntityTypes<import('@/app/typings/entities/UserEntity').UserEntity>;