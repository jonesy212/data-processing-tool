// CustomPayload.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { Payload } from '@/core/interfaces/payload/payloadTypes';
import { CustomSnapshotData } from '@/core/snapshots/SnapshotData';

// Define CustomPayload that extends Payload and aligns with CustomSnapshotData
type CustomPayload<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T> = 
  Payload & // Ensure Payload contains common properties
  CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  