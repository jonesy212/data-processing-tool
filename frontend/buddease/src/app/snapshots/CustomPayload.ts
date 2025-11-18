import { CustomSnapshotData } from '@/app/snapshots';
import { Payload } from '@/app/server/database/Payload';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { CustomSnapshotData, SnapshotData } from "@/app/snapshots/SnapshotData";
import { Attachment } from '@/app/documents/attachment/Attachment';

// Define CustomPayload that extends Payload and aligns with CustomSnapshotData
type CustomPayload<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T> = 
  Payload & // Ensure Payload contains common properties
  CustomSnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

  