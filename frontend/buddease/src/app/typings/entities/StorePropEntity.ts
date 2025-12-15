// StorePropEntity.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { NotificationTypeEnum } from '@/app/features/support/UnifiedNotificationTypes';
import { Data } from '@/app/models/data/Data';
import { StatusType } from "@/app/models/data/StatusType";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/snapshots/SnapshotStoreConfig';
import { SnapshotStoreOptions } from '@/app/snapshots/SnapshotStoreOptions';
import { SnapshotStoreProps } from '@/app/snapshots/SnapshotStoreProps';
import { createLatestVersion } from "@/app/versions/createLatestVersion";

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
type StorePropStructuredMetadata = DefaultMeta<
  StorePropEntityTemplate['T'],
  StorePropEntityTemplate['K']
>;

const { latestVersion = createLatestVersion(), ...rest } = (data as Record<string, any>) || {};

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
  createdAt: new Date(),
  updatedAt: new Date(),
  isArchived: false,
  meta: {
    version: "1.0.0",
    priority: 1,
    source: "system",
  },
  latestVersion: latestVersion
};

const baseStoreProps: SnapshotStoreProps<
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
    snapshotStore: SnapshotStore<StorePropEntity, StorePropK, StorePropMeta, StorePropAttachment, StorePropExcludedFields, StorePropIncludedFields>,
  ) => {
    console.log("Initialized StorePropSnapshotStore:", snapshotStore);
  },
  config: Promise.resolve(null),
  initialState: {} as InitializedState<StorePropEntity, StorePropEntity, StorePropMeta, Attachment, never, keyof StorePropEntity>,
  operation: { operationType: SnapshotOperationType.CreateSnapshot },
  payload: { 
    error: undefined, 
    meta: {
      name: "Sample Notification",
      timestamp: new Date(),
      type: NotificationTypeEnum.INFO,
      startDate: new Date(),
      endDate: new Date(),
      status: StatusType.Active,
      id: "unique-notification-id",
      isSticky: false,
      isDismissable: true,
      isClickable: true,
      isClosable: true,
      isAutoDismiss: true,
      isAutoDismissable: true,
      isAutoDismissOnNavigation: false,
      isAutoDismissOnAction: false,
      isAutoDismissOnTimeout: true,
      isAutoDismissOnTap: false,
      optionalData: null,
      data: {}
    }
  },
  storeProps: [],
  core: '',
  security: '',
  storage: '',
  isExpired: '',

};



export type {
  StorePropAttachment, StorePropEntity, StorePropExcludedFields,
  StorePropIncludedFields, StorePropK,
  StorePropMeta
};


  export { baseStoreProps };

