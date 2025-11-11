// BaseConfig.ts
import { BaseEntityProperties, SharedIdentifiers } from '@/app/documents/RelatedProps';
import { SharedTimestamps } from '@/app/models/CommonData';
import { AllTypes } from '@/app/typings/PropTypes';

import { BaseMetaInfo } from '@/app/config/metadata/BaseMetaInfo';
import { SchemaField } from '@/app/config/metadata/SchemaField';
import { BaseMetadata } from '@/app/config/MetaDataOptions';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Category, CategoryPropertyBundle } from '@/app/libraries/categories/generateCategoryProperties';
import { Taggable, TagsRecord } from '@/app/models/tracker/Tag';
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { BaseCacheConfig, BaseMetadataConfig, BaseRetryConfig, } from "@/app/services/ConfigurationService";
import { Snapshot } from '@/app/snapshots/Snapshot';
import { EventManager, InitializedState } from "@/app/state/stores/DataStore";
import { AppStructuredMetadata, AppUnifiedMetadata } from '@/app/typings/entities/AppMetadataEntity';
import {
    ConfigAttachment,
    ConfigEntity,
    ConfigExcludedFields,
    ConfigIncludedFields,
    ConfigK,
    ConfigMeta
} from "@/app/typings/entities/ConfigEntity";
import MemberEntity, { MemberExcludedFields } from '@/app/typings/entities/MemberEntity';
import { AppMetadata } from '@/app/typings/metadataTypes';
import { useSnapshot } from '@/state/context/SnapshotContext';
import { StructuredMetadata } from "./StructuredMetadata";
import { useMeta } from "./useMeta";
import { useMetadata } from "./useMetadata";

type BaseDataEntity = BaseDataRoot;

interface BaseDataRoot {
  [key: string]: any;
  snapshotId?: string | number | null;
}

interface RootCategories<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T
> {
   categoryIds?: string[];
    // Full category objects (when populated)
  categories?: CategoryProperties[]; 
  categoryProperties?: CategoryPropertyBundle<T, K>;
}

interface CoreRecordProperties {
  description?: string;
  source?: string;
}

interface BaseEntity<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SharedIdentifiers<T, K>,
          SharedTimestamps, CoreRecordProperties
{
  appMetadata?: AppMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  filePathOrUrl?: string;
}

// Define a type for your entities
interface Entity<
  T extends BaseDataEntity = BaseDataRoot,
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
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {} as UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
  events: {
     eventRecords: {},
  },
}

export { baseConfig, mappedSnapshot };

    export type {
        BaseConfig, BaseDataEntity, BaseDataRoot, BaseEntity, CryptoConfig,
        DefaultExcludedFields, DefaultIncludedFields, DefaultMeta, Entity, ProjectManagementConfig, SharedConfig, RootCategories
    };

