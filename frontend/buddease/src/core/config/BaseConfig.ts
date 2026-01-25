// BaseConfig.ts
import type { AppStructureItem } from '@/core/config/appStructure/AppStructure';
import type { BaseCacheConfig } from '@/core/config/CacheConfig';
import type { BaseMetaInfo } from '@/core/config/metadata/BaseMetaInfo';
import type { SchemaField } from '@/core/config/metadata/SchemaField';
import type { BaseMetadata, UnifiedMetadata } from '@/core/config/MetaDataOptions';
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import { useMeta } from '@/core/config/useMeta';
import type { useMetadata } from '@/core/config/useMetadata';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { BaseEntityProperties, SharedIdentifiers } from '@/core/documents/RelatedProps';
import type { Category, CategoryPropertyBundle } from '@/core/libraries/categories/generateCategoryProperties';
import type { SharedTimestamps } from '@/core/models/CommonData';
import type { Taggable, TagsRecord } from '@/core/models/tracker/Tag';
import { fetchUserAreaDimensions } from '@/core/pages/layouts/fetchUserAreaDimensions';
import type { BaseMetadataConfig, BaseRetryConfig, } from "@/core/services/ConfigurationService";
import type { DebugEntry, TempDataStorage } from '@/core/snapshots/methods/debugMethods';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { useSnapshot } from '@/core/state/context/SnapshotContext';
import type { EventManager, InitializedState } from '@/core/state/stores/DataStore';
import type { AppStructuredMetadata, AppUnifiedMetadata } from '@/core/typings/entities/AppMetadataEntity';
import type {
  ConfigAttachment,
  ConfigEntity,
  ConfigExcludedFields,
  ConfigIncludedFields,
  ConfigK,
  ConfigMeta
} from '@/core/typings/entities/ConfigEntity';
import type { MemberEntity, MemberExcludedFields } from '@/core/typings/entities/MemberEntity';
import type { AppMetadata } from '@/core/typings/metadataTypes';
import type { AllTypes } from '@/core/typings/PropTypes';

export type BaseDataEntity = BaseDataEntity;

interface BaseDataRoot {
  [key: string]: any;
  snapshotId?: string | number | null;
}

interface RootCategories<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T
> {
   categoryIds?: string[];
    // Full category objects (when populated)
  categories?: Category[]; 
  categoryProperties?: CategoryPropertyBundle<T, K>;
}

interface CoreRecordProperties {
  description?: string;
  source?: string;
}

interface BaseEntity<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
  > extends SharedIdentifiers<T, K>,
  SharedTimestamps, CoreRecordProperties,
  AppStructureItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
{
  appMetadata?: AppMetadata<T>;
  filePathOrUrl?: string;
}

// Define a type for your entities
interface Entity<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
          BaseEntityProperties 
{
  type?: string | AllTypes | null;
}




type DefaultMeta<
  T extends BaseDataEntity,
  K extends T = T,
  > = BaseMetaInfo & {
    structured?: Partial<Record<string, any>>;
};

type DefaultExcludedFields<T extends BaseDataEntity> = never;
type DefaultIncludedFields<T extends BaseDataEntity> = keyof T;
type MemberIncludedFields = Exclude<keyof MemberEntity, MemberExcludedFields>;

// Utility type for excluding fields
type WithoutExcluded<T, ExcludedFields extends keyof T> = Omit<T, ExcludedFields>;

interface SharedConfig {
  apiKey: string | undefined; // API key (optional)
  apiEndpoint: string; // API endpoint URL
  id?: string | number; // Unique identifier
  maxConnections?: number; // Optional: Maximum connections
  authToken?: string; // Optional: Authentication token
  debugInfo?: DebugEntry[];
  tempData?: TempDataStorage<any>;
  // Add other shared properties as needed
}

// Combine the base interfaces into a single interface
interface BaseConfig<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedConfig, 
  BaseRetryConfig, 
  BaseCacheConfig, 
  BaseMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  BaseMetadataConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  Taggable<T> {
    id?: string | number;
    apiEndpoint: string;
    apiKey: string | undefined;
    timeout: number;
    retryAttempts: number;
    isActive: boolean
    name: string;
    initialState: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    events: EventManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
    schema?: Record<string, SchemaField>
    description?: string
    category?: Category,
    timestamp: string | number | Date | undefined;
    createdBy?: string | undefined;
    tags?: TagsRecord<T> | string[];

    mappedSnapshot?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
}

// Specific configuration for project management features
interface ProjectManagementConfig<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  taskPhases: string[];
  maxCollaborators: number;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
  };
}

// Specific configuration for the crypto module
interface CryptoConfig<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  supportedCurrencies: string[];
  defaultCurrency: string;
  marketDataRefreshInterval: number;
}



const area = fetchUserAreaDimensions().toString()
const currentMetadata: AppUnifiedMetadata = useMetadata('calendar-event-area')
const currentMeta: AppStructuredMetadata = useMeta(area)


// ✅ map snapshot with explicit Config types
const mappedSnapshot: Map<string, Snapshot<ConfigEntity, ConfigK, ConfigMeta, ConfigAttachment>> = new Map(
  Array.from(
    useSnapshot<
      ConfigEntity,
      ConfigK,
      ConfigMeta,
      ConfigAttachment,
      ConfigExcludedFields,
      ConfigIncludedFields
    >().snapshotMap
  )
);

const baseConfig: BaseConfig<
  ConfigEntity,
  ConfigK,
  ConfigMeta,
  ConfigAttachment,
  ConfigExcludedFields,
  ConfigIncludedFields
> = {
  id: "snapshot1",
  category: "example category",
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: ["sample", "snapshot"],
  schema: {},
  isActive: false,
  // metadata: {
  //   area: area, 
  //   schema: {},
  //   metadataEntries: {}
  // },
  apiEndpoint: "https://api.example.com",
  apiKey: "your_api_key",
  timeout: 5000,
  retryAttempts: 3,
  name: "Base Snapshot",
  initialState: undefined,
  // mappedSnapshot: mappedSnapshot,
  meta: {} as StructuredMetadata<ConfigEntity, ConfigK, ConfigMeta, ConfigAttachment, ConfigExcludedFields, ConfigIncludedFields>,
  metadata: {} as UnifiedMetadata<ConfigEntity, ConfigK, ConfigMeta, ConfigAttachment, ConfigExcludedFields, ConfigIncludedFields>,
  events: {
     eventRecords: {},
  },
}

export { baseConfig, mappedSnapshot };

    export type {
    BaseConfig, BaseDataEntity, BaseDataRoot, BaseEntity, CryptoConfig,
    DefaultExcludedFields, DefaultIncludedFields, DefaultMeta, Entity, ProjectManagementConfig, RootCategories, SharedConfig
  };

