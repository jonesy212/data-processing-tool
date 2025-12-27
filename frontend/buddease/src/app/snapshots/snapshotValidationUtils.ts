// snapshotValidationUtils.ts

import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import type {  Snapshot } from '@/app/snapshots/Snapshot';
import { triggerOnSnapshot } from '@/app/snapshots/snapshotTrigger';


// Helper functions
const validateSnapshot = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): boolean => {
  let major: number | undefined;
  let minor: number | undefined;
  let patch: number | undefined;
  
  if (typeof snapshot.version === 'string') {
    // Parse semver string like "1.2.3"
    const parts = snapshot.version.split('.').map(part => parseInt(part, 10));
    if (parts.length === 3 && parts.every(num => !isNaN(num))) {
      [major, minor, patch] = parts;
    }
  } else {
    // It's a Version object
    major = snapshot.version?.major;
    minor = snapshot.version?.minor;
    patch = snapshot.version?.patch;
  }
  
  return !!snapshot.id &&
    !!snapshot.timestamp &&
    typeof major === 'number' &&
    typeof minor === 'number' &&
    typeof patch === 'number' &&
    major >= 0 &&
    minor >= 0 &&
    patch >= 0;
};

const processSnapshotData = (data: any, category?: string): void => {
  console.log('Processing snapshot data for category:', category);
  // Add your data processing logic here
};

const handleDataUpdateSnapshot = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): void => {
  console.log('Handling data update snapshot:', snapshot.id);
  // Specific logic for data update snapshots
};

const handleSystemEventSnapshot = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): void => {
  console.log('Handling system event snapshot:', snapshot.id);
  // Specific logic for system event snapshots
};

const handleUserActionSnapshot = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): void => {
  console.log('Handling user action snapshot:', snapshot.id);
  // Specific logic for user action snapshots
};

const handleDefaultSnapshot = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): void => {
  console.log('Handling default snapshot type:', snapshot.id);
  // Default handling logic
};

const updateSnapshotMetrics = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): void => {
  console.log('Updating metrics for snapshot:', snapshot.id);
  // Metrics and analytics tracking
};

// Optional: Async version for complex operations
export const triggerOnSnapshotAsync = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      triggerOnSnapshot(snapshot);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};


export {
    handleDataUpdateSnapshot, handleDefaultSnapshot, handleSystemEventSnapshot,
    handleUserActionSnapshot, processSnapshotData, updateSnapshotMetrics, validateSnapshot
};

