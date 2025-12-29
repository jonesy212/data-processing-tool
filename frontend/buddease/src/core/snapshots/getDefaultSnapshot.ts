// getDefaultSnapshot.ts
import { BaseDataEntity, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import type { Snapshot } from '@/core/snapshots/Snapshot';

// Helper function to create a default Snapshot instance
function getDefaultSnapshot<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
>(): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    // Basic Snapshot properties
    id: "",
    timestamp: Date.now(),
    data: new Map(),
    metadata: {},
    // Add all required Snapshot properties and methods with default implementations
    get: (key: string) => undefined,
    set: (key: string, value: any) => { },

    deleted: false, initialState: "", isCore: "", initialConfig: "", 
    onInitialize: "", taskIdToAssign: "", schema: "", currentCategory: "",
    mappedSnapshotData: "", storeId: "", versionInfo: "", initializedState: "",
    snapshotContainer: "", config: ""
    // ... other required Snapshot properties
  } as Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}
