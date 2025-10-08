import { Snapshot } from '@/app/snapshots/Snapshot';
import CalendarManagerStoreClass from "@/app/state/stores/CalendarManagerStore";

// convertSnapshotsToRecord.ts
function convertSnapshotsToRecord<
    T extends BaseDataEntity,
    K extends T = T>(
    snapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  ): Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    const record: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> = {};
  
    snapshots.forEach((snapshot, index) => {
      // Assuming `id` or a unique key is available in each snapshot
      const key = snapshot.id || `snapshot_${index}`;
  
      // Add the snapshot (casted) to the record under a unique key
      record[key] = [snapshot as unknown as CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>];
    });
  
    return record;
  }
  
  export { convertSnapshotsToRecord };
