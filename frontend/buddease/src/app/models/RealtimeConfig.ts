
export interface RealtimeConfig<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  autoSync: boolean;
  conflictResolution: 'server' | 'client' | 'manual';
  maxRetries: number;
  onUpdate?: RealtimeUpdateCallback<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  onError?: (error: Error) => void;
}