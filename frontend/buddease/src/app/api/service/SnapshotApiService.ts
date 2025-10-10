// SnapshotApiService.ts

import { useCallback } from 'react';
import { BaseData } from '@/app/models/data/Data';
import { Snapshot, SnapshotDataType } from '@/app/snapshots';

import {
  CreateOptions,
  FetchAllOptions,
  FindSubscriberOptions,
  GetConfigOptions,
  FetchOptions
} from '@/app/api/SnapshotOptions';

import { SnapshotConfig } from '@/app/snapshots';

class SnapshotApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '/api/snapshots') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Configuration Methods
  async getConfig<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    options: GetConfigOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    const {
      snapshotStore,
      snapshotId,
      createIfMissing = true,
      configOverrides = {},
      logger
    } = options;

    try {
      // If snapshotId provided, try to fetch existing config
      if (snapshotId) {
        logger?.logConfigFetch(snapshotId);
        
        // Try to fetch from API first
        const response = await fetch(`${this.baseUrl}/${snapshotId}/config`);
        if (response.ok) {
          const existingConfig = await response.json();
          return {
            ...existingConfig,
            ...configOverrides
          };
        }
      }

      // If no snapshotId or fetch failed, and createIfMissing is true
      if (createIfMissing) {
        const newConfigId = snapshotId || this.generateId();
        logger?.logConfigCreate(newConfigId);

        // Create new config with defaults and overrides
        const defaultConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
          autoSave: true,
          syncInterval: 5000,
          logging: false,
          priority: 'medium',
          snapshotLimit: 100,
          autoSync: true,
          tags: [],
          category: undefined,
          subscriberManagement: {
            enabled: true,
            maxRetries: 3,
            retryDelay: 1000
          },
          ...configOverrides
        };

        // Save new config to API
        await fetch(`${this.baseUrl}/config`, {
          method: 'POST',
          headers: this.defaultHeaders,
          body: JSON.stringify({
            id: newConfigId,
            config: defaultConfig
          })
        });

        return defaultConfig as SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      }

      throw new Error(`Configuration not found for snapshot: ${snapshotId}`);
    } catch (error) {
      console.error('Failed to get config:', error);
      throw error;
    }
  }

  // CRUD Operations
  async create<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    options?: CreateOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    const {
      meta = {},
      metadata = {},
      validate = true,
      callbacks = {},
      config
    } = options || {};

    try {
      // Pre-create callback
      callbacks.preCreate?.(snapshot);

      // Validation
      if (validate) {
        await this.validateSnapshot(snapshot);
      }

      // Enhance snapshot with metadata
      const enhancedSnapshot = this.enhanceSnapshotWithMetadata(
        snapshot,
        meta,
        metadata
      );

      // API call to create snapshot
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          snapshot: enhancedSnapshot,
          config
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create snapshot: ${response.statusText}`);
      }

      const createdSnapshot = await response.json();

      // Post-create callback
      callbacks.postCreate?.(createdSnapshot);

      return createdSnapshot;
    } catch (error) {
      callbacks.onError?.(error as Error);
      console.error('Create snapshot failed:', error);
      throw error;
    }
  }

  async fetchById<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    snapshotId: string,
    options?: FetchOptions
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined> {
    const {
      includeFields = [],
      excludeFields = [],
      withMetadata = false
    } = options || {};

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (includeFields.length > 0) {
        params.append('include', includeFields.join(','));
      }
      if (excludeFields.length > 0) {
        params.append('exclude', excludeFields.join(','));
      }
      params.append('withMetadata', withMetadata.toString());

      const response = await fetch(`${this.baseUrl}/${snapshotId}?${params}`);

      if (response.status === 404) {
        return undefined;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch snapshot: ${response.statusText}`);
      }

      const snapshot = await response.json();
      
      // Process with category if needed
      if (snapshot.category) {
        return this.processWithCategory(snapshot, snapshotId);
      }

      return snapshot;
    } catch (error) {
      console.error(`Fetch snapshot ${snapshotId} failed:`, error);
      throw error;
    }
  }

  // Subscriber Operations
  async findSubscriber<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    subscriberId: string,
    options: FindSubscriberOptions
  ): Promise<Subscriber<T, K>> {
    const {
      category,
      endpointCategory,
      queryParams = {},
      subscriberConfig,
      logger
    } = options;

    try {
      logger?.logSubscriberFetch(subscriberId);

      // Build query parameters
      const params = new URLSearchParams({
        subscriberId,
        endpointCategory: endpointCategory.toString(),
        ...queryParams
      });

      if (category) {
        params.append('category', category.id);
      }

      const response = await fetch(`${this.baseUrl}/subscribers?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to find subscriber: ${response.statusText}`);
      }

      const subscriberData = await response.json();

      // Create subscriber instance with config
      const subscriber: Subscriber<T, K> = {
        ...subscriberData,
        config: {
          maxRetries: subscriberConfig?.maxRetries || 3,
          retryDelay: subscriberConfig?.retryDelay || 1000,
          ...subscriberConfig
        }
      };

      return subscriber;
    } catch (error) {
      console.error(`Find subscriber ${subscriberId} failed:`, error);
      throw error;
    }
  }

  // Bulk Operations
  async fetchAll<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    options?: FetchAllOptions<T, K>
  ): Promise<Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
    const {
      criteria = {},
      sort,
      pagination,
      fields,
      config
    } = options || {};

    try {
      // Build query parameters
      const params = new URLSearchParams();

      // Add criteria
      if (Object.keys(criteria).length > 0) {
        params.append('criteria', JSON.stringify(criteria));
      }

      // Add sorting
      if (sort) {
        params.append('sortField', sort.field as string);
        params.append('sortDirection', sort.direction);
      }

      // Add pagination
      if (pagination) {
        params.append('limit', pagination.limit.toString());
        params.append('offset', pagination.offset.toString());
      }

      // Add fields
      if (fields) {
        if (fields.include) {
          params.append('includeFields', fields.include.join(','));
        }
        if (fields.exclude) {
          params.append('excludeFields', fields.exclude.join(','));
        }
      }

      // Add config
      if (config) {
        params.append('config', JSON.stringify(config));
      }

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch snapshots: ${response.statusText}`);
      }

      const snapshots = await response.json();

      // Process each snapshot with category if needed
      return snapshots.map((snapshot: any, index: number) => {
        if (snapshot.category) {
          return this.processWithCategory(snapshot, snapshot.id || `snapshot-${index}`);
        }
        return snapshot;
      });
    } catch (error) {
      console.error('Fetch all snapshots failed:', error);
      throw error;
    }
  }

  // Utility Methods
  private processWithCategory<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    response: any,
    snapshotId: string
  ): SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined {
    try {
      if (!response || !response.category) {
        return undefined;
      }

      // Process category-specific data
      const categoryData = this.processCategoryData(response.category, response.data);

      return {
        ...response,
        id: snapshotId,
        data: categoryData,
        processedAt: new Date().toISOString(),
        categoryProcessed: true
      };
    } catch (error) {
      console.error(`Process with category failed for ${snapshotId}:`, error);
      return undefined;
    }
  }

  private async validateSnapshot<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  ): Promise<void> {
    // Basic validation
    if (!snapshot.id) {
      throw new Error('Snapshot must have an ID');
    }

    if (!snapshot.data) {
      throw new Error('Snapshot must have data');
    }

    // Schema validation if schema exists
    if (snapshot.metadata?.schema) {
      await this.validateAgainstSchema(snapshot.data, snapshot.metadata.schema);
    }

    // Custom validation logic can be added here
  }

  private enhanceSnapshotWithMetadata<T extends BaseDataEntity, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>, AttachmentType extends Attachment = Attachment, ExcludedFields extends keyof T = DefaultExcludedFields<T>, IncludedFields extends keyof T = keyof T>(
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    meta: Partial<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    metadata: UnifiedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | {}
  ): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    const timestamp = new Date().toISOString();

    return {
      ...snapshot,
      metadata: {
        ...snapshot.metadata,
        ...meta,
        ...metadata,
        timestamp: snapshot.metadata?.timestamp || timestamp,
        author: snapshot.metadata?.author || 'system',
        version: (snapshot.metadata?.version || 0) + 1
      },
      lastModified: timestamp
    };
  }

  private processCategoryData(category: Category, data: any): any {
    // Implement category-specific data processing
    if (category.properties?.transform) {
      return category.properties.transform(data);
    }

    return data;
  }

  private async validateAgainstSchema(data: any, schema: Record<string, any>): Promise<void> {
    // Basic schema validation
    for (const [key, fieldSchema] of Object.entries(schema)) {
      if (fieldSchema.required && !(key in data)) {
        throw new Error(`Required field ${key} is missing`);
      }

      if (data[key] !== undefined && fieldSchema.type) {
        const actualType = typeof data[key];
        if (actualType !== fieldSchema.type) {
          throw new Error(`Field ${key} should be ${fieldSchema.type}, got ${actualType}`);
        }
      }
    }
  }

  private generateId(): string {
    return `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}




// api/snapshotApi.ts
const snapshotApi = new SnapshotApiService();

// React-friendly functional wrappers
export const useSnapshotApi = () => {
  const createSnapshot = useCallback(
    async <
      T extends BaseData<any, any, any, any, any>,
      K extends T = T
    >(
      snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      options?: CreateOptions
    ) => {
      return snapshotApi.create(snapshot, options);
    },
    []
  );

  // Wrap other methods as needed for React
  return {
    createSnapshot,
    fetchById: snapshotApi.fetchById.bind(snapshotApi),
    // ... other methods
  };
};

export default SnapshotApiService
  