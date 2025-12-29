// SnapshotOptions.tsx

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { BaseData } from '@/core/models/data/Data';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/core/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';

  interface CreateOptions<
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  > {
    /**
     * Additional metadata for the snapshot
     */
    meta?: Partial<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    //main metadata config
    metadata?: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {},
    
    /**
     * Whether to validate before creation
     * @default true
     */
    validate?: boolean;
    
    /**
     * Callbacks for different lifecycle events
     */
    callbacks?: {
      preCreate?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      postCreate?: (createdSnapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
      onError?: (error: Error) => void;
    };
    
    /**
     * Related configuration from your existing structure
     */
    config?: Pick<
      SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      'autoSave' | 'syncInterval' | 'logging' | 'priority'
    >;
  }
  
  interface GetConfigOptions<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T> {
    /**
     * The snapshot store to use for config creation
     */
    snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    
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
    configOverrides?: Partial<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    
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
      field: keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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
      include?: Array<keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
      exclude?: Array<keyof Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
    };
    
    /**
     * Using your existing config properties
     */
    config?: Pick<
      SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    FetchAllOptions, FindSubscriberOptions,
    GetConfigOptions
};

