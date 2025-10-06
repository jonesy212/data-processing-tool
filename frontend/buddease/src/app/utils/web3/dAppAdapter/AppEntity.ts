
import { DefaultExcludedFields, BaseDataEntity, DefaultMeta, baseConfig } from '@/config/BaseConfig';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";

// AppEntity.ts
type AppEntity = BaseDataEntity;
type AppK = AppEntity;
type AppMeta = DefaultMeta<AppEntity, AppK>;
type AppAttachment = Attachment
type AppExcludedFields = DefaultExcludedFields<AppEntity>;
type AppIncludedFields = keyof AppEntity; // defaults to everything

// Create a base type with all your App type parameters
type AppBaseParams = {
  T: AppEntity;
  K: AppK;
  Meta: AppMeta;
  AttachmentType: AppAttachment;
  ExcludedFields: AppExcludedFields;
  IncludedFields: AppIncludedFields;
};


// Helper type to extract UnifiedMetadata with App types
type AppUnifiedMetadata = UnifiedMetadata<
  AppBaseParams['T'],
  AppBaseParams['K'], 
  AppBaseParams['Meta'],
  AppBaseParams['AttachmentType'],
  AppBaseParams['ExcludedFields'],
  AppBaseParams['IncludedFields']
>;

// Helper type for StructuredMetadata
type AppStructuredMetadata = StructuredMetadata<
  AppBaseParams['T'],
  AppBaseParams['K'],
  AppBaseParams['Meta'],
  AppBaseParams['AttachmentType'],
  AppBaseParams['ExcludedFields'],
  AppBaseParams['IncludedFields']
>;

// Clean usage
const currentMetadata: AppUnifiedMetadata = useMetadata('notification-area');
const currentMeta: AppStructuredMetadata = useMeta(area);



// Core snapshot types
type AppSnapshot = Snapshot<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSnapshotData = SnapshotData<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSnapshotStore = SnapshotStore<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSnapshotWithCriteria = SnapshotWithCriteria<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSubscriberCollection = SubscriberCollection<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppRealtimeDataItem = RealtimeDataItem<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;

// Configuration types
type AppSnapshotStoreConfig = SnapshotStoreConfig<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;
type AppSnapshotsArray = SnapshotsArray<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;

// PARAMS
type AppParams = SnapshotConfigParams<AppEntity, AppK,  AppMeta, AppAttachment, AppExcludedFields, AppIncludeField>;

// Utility to pick or omit fields dynamically
type ApplyFieldFilters<
  T extends BaseDataEntity,
  Excluded extends keyof T = never,
  Included extends keyof T = keyof T
> = Pick<Omit<T, Excluded>, Included>;

type PublicUser = ApplyFieldFilters<UserEntity, "password" | "secret", "id" | "name" | "email">;

export type { 
  AppEntity,
  AppK,
  AppMeta,
  AppExcludedFields,
  AppIncludedFields,
  AppSnapshot,
  AppSnapshotData,
  AppSnapshotStore,
  AppSnapshotWithCriteria,
  AppSubscriberCollection,
  AppRealtimeDataItem,
  AppSnapshotStoreConfig,
  AppSnapshotsArray,
  AppParams,
  AppBaseParams,
  AppUnifiedMetadata,
  AppStructuredMetadata
}