// import { Attachment } from '@/app/documents/attachment/Attachment';
// import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';

// Define CustomPayload that extends Payload and aligns with CustomSnapshotData
type CustomPayload<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T> = 
  Payload & // Ensure Payload contains common properties
  CustomSnapshotData<T, K, Meta>;

  