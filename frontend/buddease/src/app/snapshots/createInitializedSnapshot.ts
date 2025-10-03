// createInitializedSnapshot.ts
import { createBaseSnapshot } from '@/app/snapshots/createBaseSnapshot'
// Helper for InitializedSnapshot
function createInitializedSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(): InitializedSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  const baseSnapshot = createBaseSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
  
  return {
    ...baseSnapshot,
    isInitialized: true,
    initializedAt: new Date(),
    version: "1.0.0",
    initializedFrom: 'local',
    initializationContext: {}
  };
}