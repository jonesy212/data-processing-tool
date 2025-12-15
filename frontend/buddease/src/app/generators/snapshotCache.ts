// snapshotCache.ts
import { BaseDataEntity, DefaultMeta } from '@/app/config/BaseConfig';
import { SnapshotData } from "@/app/snapshots/SnapshotData";
import { SnapshotAttachment, SnapshotEntity, SnapshotExcludedFields, SnapshotIncludedFields, SnapshotK, SnapshotMeta } from '@/app/typings/entities/SnapshotEntity';

import { Attachment } from '@/app/documents/attachment/Attachment';

const snapshotCache = new Map<string, SnapshotData<SnapshotEntity, SnapshotK, SnapshotMeta, SnapshotAttachment, SnapshotExcludedFields, SnapshotIncludedFields>>();

function getCachedSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string
): SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
  const data = snapshotCache.get(snapshotId);
  if (data) console.log(`Cache hit for snapshot ID: ${snapshotId}`);
  else console.log(`Cache miss for snapshot ID: ${snapshotId}`);
  return data as SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
}


  
function cacheSnapshotData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  data: SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) {
  snapshotCache.set(snapshotId, data as any);
  console.log(`Data cached for snapshot ID: ${snapshotId}`);
}

export { cacheSnapshotData, getCachedSnapshotData };
