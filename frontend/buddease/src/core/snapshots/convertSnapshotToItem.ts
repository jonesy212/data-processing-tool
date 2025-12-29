// convertSnapshotToItem.ts
// import { Data } from '@/core/models/data/Data';
// import type {  Snapshot } from '@/core/snapshots/Snapshot';
// import { SnapshotItem } from "@/core/snapshots/SnapshotList";
// import { Attachment } from '@/core/documents/attachment/Attachment';
// import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';

// // convertSnapshotToItem.ts
// function convertSnapshotToItem<  T extends BaseDataEntity,
  // K extends T = T,
  // Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  // AttachmentType extends Attachment = Attachment,
  // ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  // IncludedFields extends keyof T = keyof T>(
//   snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
//   id: string
// ): SnapshotItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
//   return {
//     id,
//     user: snapshot.user,
//     label: snapshot.label,
//     data: snapshot.data ?? new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
//     metadata: snapshot.metadata,
//     message: snapshot.message,
//     value: snapshot.value,
//     category: snapshot.category,
//     timestamp: snapshot.timestamp,
//     type: snapshot.type,
//     status: snapshot.status,
//   };
// }
