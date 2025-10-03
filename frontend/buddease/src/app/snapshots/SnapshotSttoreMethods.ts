// SnapshotSttoreMethods.ts

import { Category } from "@/app/data_analysis/frontend/buddease/src/app/components/libraries/categories/generateCategoryProperties";
import { StatusType } from "@/app/data_analysis/frontend/buddease/src/app/components/models/data/StatusType";
import { RealtimeDataItem } from "@/app/data_analysis/frontend/buddease/src/app/components/models/realtime/RealtimeData";
import CalendarManagerStoreClass from "@/app/data_analysis/frontend/buddease/src/app/components/state/stores/CalendarManagerStore";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/data_analysis/frontend/buddease/src/app/configs/BaseConfig";
import { Snapshot, SnapshotStoreConfig } from ".";
import { ConfigureSnapshotStorePayload } from "./SnapshotConfig";
import { SnapshotStoreMap } from './SnapshotMethods';
import SnapshotStore from "./SnapshotStore";
import { SnapshotStoreReference } from "./SnapshotStoreReference";
import { SnapshotStoreProps } from "./useSnapshotStore";

// Separate interface for store operations
interface SnapshotStoreMethods<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  // Store CRUD Operations
  addStore: (
    storeId: number,
    snapshotId: string | null,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K, Meta, ExcludedFields> | null;
  
  getStore: (
    storeId: number,
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotId: string | null,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ) => SnapshotStore<T, K, Meta, ExcludedFields> | null;

  removeStore: (
    storeId: number,
    store: SnapshotStore<T, K, Meta, ExcludedFields>,
    snapshotId: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    type: string,
    event: Event
  ) => void;

  getStores: (
    storeId: number,
    snapshotId: string,
    snapshotStoreConfigs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
    snapshotStores?: SnapshotStoreReference<T, K, Meta, ExcludedFields>[] | Map<number, SnapshotStore<T, K, Meta>>
  ) => SnapshotStoreMap;
  
stores: (
  storeProps: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
  options?: {
    // FILTERING OPTIONS
    filter?: (store: SnapshotStore<T, K, Meta, ExcludedFields>) => boolean;
    category?: Category | Category[];
    status?: StatusType | StatusType[];
    
    // PAGINATION OPTIONS
    limit?: number;
    offset?: number;
    
    // SORTING OPTIONS
    sortBy?: keyof SnapshotStore<T, K, Meta, ExcludedFields> | ((a: SnapshotStore<T, K, Meta, ExcludedFields>, b: SnapshotStore<T, K, Meta, ExcludedFields>) => number);
    sortOrder?: 'asc' | 'desc';
    
    // PERFORMANCE OPTIONS
    lazyLoad?: boolean;
    batchSize?: number;
    
    // CACHING OPTIONS
    cacheKey?: string;
    cacheTimeout?: number;
    forceRefresh?: boolean;
    
    // RELATIONSHIP OPTIONS
    includeSnapshots?: boolean;
    includeSubscribers?: boolean;
    depth?: number; // For nested relationships
    
    // ERROR HANDLING
    onError?: (error: Error) => void;
    
    // TRANSFORMATION OPTIONS
    transform?: (store: SnapshotStore<T, K, Meta, ExcludedFields>) => any;
    
    // METADATA OPTIONS
    withMetadata?: boolean;
    metadataFields?: (keyof Meta)[];
  },
  context?: {
    // EXECUTION CONTEXT
    requestId?: string;
    userId?: string;
    sessionId?: string;
    
    // PERFORMANCE CONTEXT
    timeout?: number;
    priority?: 'low' | 'normal' | 'high';
    
    // TRACKING CONTEXT
    source?: string; // e.g., 'ui', 'api', 'background-job'
    traceId?: string;
  }
) => SnapshotStore<T, K, Meta, ExcludedFields>[];
  
  
  configureSnapshotStore: (
    snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>,
    storeId: number,
    snapshotId: string,
    data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    events: Record<string, CalendarManagerStoreClass<T, K, Meta, ExcludedFields>[]>,
    dataItems: RealtimeDataItem<T, K, Meta, ExcludedFields>[],
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    payload: ConfigureSnapshotStorePayload<T, K, Meta, ExcludedFields>,
    store: SnapshotStore<any, K>,
    callback: (snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields>) => void,
    config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ) => void;
}


export type { SnapshotStoreMethods };
