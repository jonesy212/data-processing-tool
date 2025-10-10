// BaseConfig.ts
import { Category } from '@/app/libraries/categories/generateCategoryProperties';
import { TagsRecord } from '@/app/snapshots/SnapshotWithCriteria';
import { UnifiedMetadata } from "@/server/database/MetaDataOptions";
import { fetchUserAreaDimensions } from '@/app/pages/layouts/fetchUserAreaDimensions';
import { useSnapshot } from '@/context/SnapshotContext';

import { Taggable } from '@/app/models/CommonData';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { K, T, Meta } from '@/app/models/data/dataStoreMethods';
import { EventManager, InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { BaseCacheConfig, BaseMetadataConfig, BaseRetryConfig, } from "../app/services/ConfigurationService";
import { BaseMetadata } from '@/server/database/MetaDataOptions';
import { StructuredMetadata } from "./StructuredMetadata";
import { useMeta } from "./useMeta";
import { useMetadata } from "./useMetadata";
import { SharedIdentifiers } from '@/app/documents/RelatedProps';
import { AttachmentType } from '@/app/components/documents/NoteData';
import { ExcludedFields } from '@/app/components/routing/Fields';
import { Attachment } from '@/app/features/support/SupportTicketComponent';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';

type BaseDataEntity = BaseDataRoot;

interface BaseDataRoot {
  [key: string]: any;
  snapshotId?: string | number | null;
  categoryProperties?: CategoryProperties;
}

type DefaultMeta<
  T extends BaseDataEntity,
  K extends T = T,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = never,
  IncludedFields extends keyof T = keyof T
> = StructuredMetadata<T, K, any, AttachmentType, ExcludedFields, IncludedFields>;


type DefaultExcludedFields<T extends BaseDataEntity> = never;
type DefaultIncludedFields<T extends BaseDataEntity> = keyof T;

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
  BaseMetadataConfig<T, K, Meta>,
  BaseMetadata<K>,
  Taggable<T, K> {
  id?: string | number;
  apiEndpoint: string;
  apiKey: string | undefined;
  timeout: number;
  retryAttempts: number;
  isActive: boolean
  name: string;
  description?: string
  category?: Category,
  timestamp: string | number | Date | undefined;
  createdBy?: string | undefined;
  tags?: string[] | TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
  initialState: InitializedState<T, K>;
  meta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  events: EventManager<T, K>;
}

// Specific configuration for project management features
interface ProjectManagementConfig<
  T extends  BaseDataEntity,
  K extends T = T
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
const metadata: UnifiedMetadata<T, K> = useMetadata<T, K>(area)
const currentMeta: StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = useMeta<T, K>(area)

const mappedSnapshot: Map<string, Snapshot<T, K, DefaultMeta<T, K>, never>> = new Map(
  Array.from(useSnapshot<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, never>().snapshotMap)
);

const baseConfig: BaseConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
  id: "snapshot1",
  category: "example category",
  timestamp: new Date(),
  createdBy: "creator1",
  description: "Sample snapshot description",
  tags: ["sample", "snapshot"],
  schema: {},
  isActive: false,
  metadata: {
    area: area, 
    schema: {},
    metadataEntries: {}
  },
  apiEndpoint: "https://api.example.com",
  apiKey: "your_api_key",
  timeout: 5000,
  retryAttempts: 3,
  name: "Base Snapshot",
  initialState: undefined,
  mappedSnapshot: mappedSnapshot,
  meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  events: {
     eventRecords: {},
  },
}

export { baseConfig, mappedSnapshot };
export type {
  BaseConfig, CryptoConfig, ProjectManagementConfig, SharedConfig,
  BaseDataEntity,
  DefaultMeta,
  DefaultExcludedFields,
  BaseDataRoot,
  DefaultIncludedFields
 };

