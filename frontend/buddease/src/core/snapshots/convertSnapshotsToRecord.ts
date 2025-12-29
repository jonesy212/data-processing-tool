// convertSnapshotsToRecord.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import CalendarManagerStoreClass from "@/core/state/stores/CalendarManagerStore";

import { Attachment } from '@/core/documents/attachment/Attachment';

function convertSnapshotsToRecord<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
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
