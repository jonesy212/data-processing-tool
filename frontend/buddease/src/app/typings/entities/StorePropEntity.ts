// StorePropEntity.ts
import { Data } from '@/app/models/data/Data';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SnapshotStoreProps } from '@/app/snapshots/SnapshotStoreProps';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";

// ------------------------------
// 1️⃣ Base StorePropEntity definition
// ------------------------------
// --- Core entity definition ---

interface StorePropEntity extends BaseDataEntity {
  id: string | number;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  isArchived?: boolean;
}

// --- 6-type alias pattern ---
type StorePropK = StorePropEntity;
type StorePropMeta = DefaultMeta<StorePropEntity, StorePropK>;
type StorePropAttachment = Attachment;
type StorePropExcludedFields = DefaultExcludedFields<StorePropEntity>;
type StorePropIncludedFields = keyof StorePropEntity;


// ------------------------------
// 2️⃣ Unified template for all generics
// ------------------------------
type StorePropEntityTemplate = {
  T: StorePropEntity;
  K: StorePropEntity;
  Meta: DefaultMeta<StorePropEntity, StorePropEntity>;
  AttachmentType: Attachment;
  ExcludedFields: DefaultExcludedFields<StorePropEntity>;
  IncludedFields: keyof StorePropEntity;
};

// ------------------------------
// 3️⃣ Structured Metadata with StorePropEntityTemplate
// ------------------------------
type StorePropStructuredMetadata = DefaultMeta<T
  StorePropEntityTemplate['T'],
  StorePropEntityTemplate['K']
>;

// Example Data object
const coreData: Data<
  StorePropEntityTemplate['T'],
  StorePropEntityTemplate['K'],
  StorePropStructuredMetadata,
  StorePropEntityTemplate['AttachmentType'],
  StorePropEntityTemplate['ExcludedFields'],
  StorePropEntityTemplate['IncludedFields']
> = {
  id: "store-prop-001",
  name: "Example StoreProp Entity",
  description: "This demonstrates use of the unified store prop entity pattern.",
  category: "Demo",
  tags: ["store", "snapshot", "metadata"],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isArchived: false,
  meta: {
    version: "1.0.0",
    priority: 1,
    source: "system",
  },
};

const storeProps: SnapshotStoreProps<
  StorePropEntityTemplate['T'],
  StorePropEntityTemplate['K'],
  StorePropEntityTemplate['Meta'],
  StorePropEntityTemplate['AttachmentType'],
  StorePropEntityTemplate['ExcludedFields'],
  StorePropEntityTemplate['IncludedFields']
> = {
  storeId: "store-prop-store-001",                    // Required
  name: "StoreProp Snapshot Store",                   // Required
  endpointCategory: "store-props",                    // Required
  expirationDate: new Date(Date.now() + 86400000),    // Required - 24 hours from now
  category: "store-props",                            // Required
  timestamp: new Date(),                              // Required
  criteria: {},                                       // Required
  snapshotStoreConfig: {} as SnapshotStoreConfig<StorePropEntity, StorePropK, StorePropMeta, StorePropAttachment, StorePropExcludedFields, StorePropIncludedFields>,                            // Required
  schema: {},                                         // Required
  options: {} as SnapshotStoreOptions<StorePropEntity, StorePropK, StorePropMeta, StorePropAttachment, StorePropExcludedFields, StorePropIncludedFields>,                                        // Required
  callback: (
    snapshotStore: SnapshotStore
  ) => {
    console.log("Initialized StorePropSnapshotStore:", snapshotStore);
  },
};



export type { 
  StorePropEntity,
  StorePropK,
  StorePropMeta,
  StorePropAttachment,
  StorePropExcludedFields,
  StorePropIncludedFields
}