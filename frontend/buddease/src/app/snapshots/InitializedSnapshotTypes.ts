import { Attachment } from '@/app/documents/attachment/Attachment';
import { Snapshot } from '@/app/snapshots/Snapshot';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { InitializedSnapshot } from '@/app/snapshots/SnapshotStoreOptions';
import { YourResponseType } from '@/app/typings/responseTypes';
import { enrichSnapshotStore, isSnapshotStore, isYourResponseType, normalizeSnapshot, transformResponse } from "@/app/typings/YourSpecificSnapshotType";
import { isSnapshot } from '@/app/utils/snapshotUtils';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
/**
 * Converts API response data to an InitializedSnapshot with proper typing
 */
function convertResponseToSnapshot<  
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: unknown
): InitializedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // First convert to the proper intermediate type
  const converted = convertToIntermediateType<T, K, Meta>(data);
  
  // Then enrich to create an InitializedSnapshot
  return enrichAsInitializedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(converted);
}

/**
 * Handles the first step of conversion to known types
 */
function convertToIntermediateType<  
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  data: unknown
): YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta> {
  if (isSnapshotStore<T, K, Meta>(data)) {
    return enrichSnapshotStore(data);
  } else if (isSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(data)) {
    return normalizeSnapshot(data);
  } else if (isYourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(data)) {
    return transformResponse(data);
  }
  throw new Error(`Unsupported response type: ${typeof data}`);
}

/**
 * Transforms intermediate types into an InitializedSnapshot
 */
function enrichAsInitializedSnapshot<  
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  data: YourResponseType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta>
): InitializedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const baseSnapshot = isSnapshotStore(data) 
    ? data.getLatestSnapshot() 
    : data;
  
  return {
    ...baseSnapshot,
    isInitialized: true,
    initializedAt: new Date(),
    // Copy over any existing metadata
    ...('metadata' in data ? { metadata: data.metadata } : {}),
    // Ensure required snapshot properties exist
    snapshotsArray: 'snapshotsArray' in data ? data.snapshotsArray : [],
    // Add any other required InitializedSnapshot properties
    initializationContext: {
      source: isYourResponseType(data) ? 'api-response' : 
             isSnapshotStore(data) ? 'snapshot-store' : 'snapshot',
      convertedAt: new Date().toISOString()
    }
  };
}

export {
  convertResponseToSnapshot, convertToIntermediateType,
  enrichAsInitializedSnapshot
};

