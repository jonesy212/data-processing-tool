// StorePropEntity.ts
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
  createdAt?: number;
  updatedAt?: number;
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
type StorePropStructuredMetadata = StructuredMetadata<
  StorePropEntityTemplate['T'],
  StorePropEntityTemplate['K'],
  StorePropEntityTemplate['Meta'],
  StorePropEntityTemplate['AttachmentType'],
  StorePropEntityTemplate['ExcludedFields'],
  StorePropEntityTemplate['IncludedFields']
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
  callback: (
    snapshotStore: SnapshotStore
  ) => {
    console.log("Initialized StorePropSnapshotStore:", snapshotStore);
  },
};
