export type SnapshotContainerEntity<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = SnapshotContainer<
  SnapshotEntityDataInterface<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
>;