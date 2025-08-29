// SnapshotOptions.tsx
import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/app/components/models/data/Data';
import { Snapshot } from "@/app/components/snapshots";
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/app/components/snapshots/SnapshotWithCriteria';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

  interface CreateOptions<T extends BaseData = BaseData, K extends T = T> {
    /**
     * Additional metadata for the snapshot
     */
    metadata?: Partial<StructuredMetadata<T, K>>;
    
    /**
     * Whether to validate before creation
     * @default true
     */
    validate?: boolean;
    
    /**
     * Callbacks for different lifecycle events
     */
    callbacks?: {
      preCreate?: (snapshot: Snapshot<T, K>) => void;
      postCreate?: (createdSnapshot: Snapshot<T, K>) => void;
      onError?: (error: Error) => void;
    };
    
    /**
     * Related configuration from your existing structure
     */
    config?: Pick<
      SnapshotStoreConfig<T, K>,
      'autoSave' | 'syncInterval' | 'logging' | 'priority'
    >;
  }
  
  interface GetConfigOptions<T extends BaseData = BaseData, K extends T = T> {
    /**
     * The snapshot store to use for config creation
     */
    snapshotStore?: SnapshotStore<T, K>;
    
    /**
     * Snapshot ID to fetch existing config
     */
    snapshotId?: string;
    
    /**
     * Whether to create if missing
     * @default true
     */
    createIfMissing?: boolean;
    
    /**
     * Configuration overrides
     */
    configOverrides?: Partial<SnapshotStoreConfig<T, K>>;
    
    /**
     * Logger instance (using your UILogger)
     */
    logger?: {
      logConfigFetch: (id: string) => void;
      logConfigCreate: (id: string) => void;
    };
  }
  
  interface FetchAllOptions<T extends BaseData = BaseData, K extends T = T> {
    /**
     * Filter criteria
     */
    criteria?: Partial<SnapshotWithCriteria<T, K>>;
    
    /**
     * Sorting options
     */
    sort?: {
      field: keyof Snapshot<T, K>;
      direction: 'asc' | 'desc';
    };
    
    /**
     * Pagination
     */
    pagination?: {
      limit: number;
      offset: number;
    };
    
    /**
     * Fields to include/exclude
     */
    fields?: {
      include?: Array<keyof Snapshot<T, K>>;
      exclude?: Array<keyof Snapshot<T, K>>;
    };
    
    /**
     * Using your existing config properties
     */
    config?: Pick<
      SnapshotStoreConfig<T, K>,
      'snapshotLimit' | 'autoSync' | 'tags' | 'category'
    >;
  }
  
  interface FindSubscriberOptions {
    /**
     * Category filter
     */
    category?: Category;
    
    /**
     * Endpoint category (from your existing pattern)
     */
    endpointCategory: string | number;
    
    /**
     * Additional query parameters
     */
    queryParams?: Record<string, any>;
    
    /**
     * Using your existing subscriber management config
     */
    subscriberConfig?: Pick<
      SnapshotStoreConfig<any, any>,
      'subscriberManagement' | 'maxRetries' | 'retryDelay'
    >;
    
    /**
     * Logger instance (using your UILogger)
     */
    logger?: {
      logSubscriberFetch: (id: string) => void;
    };
  }

  export type {
  CreateOptions,
  FetchAllOptions,
  FindSubscriberOptions,
  GetConfigOptions
};
