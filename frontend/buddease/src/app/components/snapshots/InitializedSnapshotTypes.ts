import { Snapshot } from "@/app/components/snapshots";
import { convertResponseToSnapshot, enrichSnapshotStore, isSnapshotStore, isYourResponseType, normalizeSnapshot, transformResponse } from "@/app/components/typings/YourSpecificSnapshotType";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { YourResponseType } from '../typings/types';
import { isSnapshot } from '../utils/snapshotUtils';
import SnapshotStore from './SnapshotStore';
import { InitializedSnapshot } from './SnapshotStoreOptions';



/**
 * Converts API response data to an InitializedSnapshot with proper typing
 */
function convertResponseToSnapshot<T extends BaseDataEntity, K extends T, Meta extends StructuredMetadata<T, K>>(
  data: unknown
): InitializedSnapshot<T, K, Meta, ExcludedFields> {
  // First convert to the proper intermediate type
  const converted = convertToIntermediateType<T, K, Meta>(data);
  
  // Then enrich to create an InitializedSnapshot
  return enrichAsInitializedSnapshot<T, K, Meta, ExcludedFields>(converted);
}

/**
 * Handles the first step of conversion to known types
 */
function convertToIntermediateType<T extends BaseDataEntity, K extends T, Meta extends StructuredMetadata<T, K>>(
  data: unknown
): YourResponseType<T, K, Meta> | Snapshot<T, K, Meta, ExcludedFields> | SnapshotStore<T, K, Meta> {
  if (isSnapshotStore<T, K, Meta>(data)) {
    return enrichSnapshotStore(data);
  } else if (isSnapshot<T, K, Meta, ExcludedFields>(data)) {
    return normalizeSnapshot(data);
  } else if (isYourResponseType<T, K, Meta>(data)) {
    return transformResponse(data);
  }
  throw new Error(`Unsupported response type: ${typeof data}`);
}

/**
 * Transforms intermediate types into an InitializedSnapshot
 */
function enrichAsInitializedSnapshot<T extends BaseDataEntity, K extends T, Meta extends StructuredMetadata<T, K>>(
  data: YourResponseType<T, K, Meta> | Snapshot<T, K, Meta, ExcludedFields> | SnapshotStore<T, K, Meta>
): InitializedSnapshot<T, K, Meta, ExcludedFields> {
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

