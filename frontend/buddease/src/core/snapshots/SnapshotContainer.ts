// SnapshotContainer.ts
import { endpoints } from "@/core/api/endpointConfigurations";
import { SnapshotCategory } from "@/core/api/getSnapshotEndpoint";
import { ContentItem } from '@/core/cards/DummyCardLoader';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import { SnapshotManager } from "@/core/hooks/useSnapshotManager";
import { Category, SnapshotCategoryMethods } from '@/core/libraries/categories/generateCategoryProperties';
import { Content } from "@/core/models/content/AddContent";
import type { Data } from '@/core/models/data/Data';
import { CriteriaType } from '@/core/pages/searches/CriteriaType';
import type { SharedMetadata } from '@/core/shared/SharedMetadata';
import { createCompleteSnapshot } from '@/core/snapshots/createSnapshot';
import { Snapshots, SnapshotsArray, SnapshotsObject } from '@/core/snapshots/LocalStorageSnapshotStore';
import type { Snapshot } from '@/core/snapshots/Snapshot';
import { Version } from "@/core/versions/Version";

import type { BaseDataEntity, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { TagsRecord } from '@/core/models/tracker/Tag';
import { SnapshotConfig } from "@/core/snapshots/SnapshotConfig";
import { SnapshotData, SnapshotRelationships } from "@/core/snapshots/SnapshotData";
import { SnapshotMethods } from "@/core/snapshots/SnapshotMethods";
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { InitializedConfig, SnapshotStoreConfig } from "@/core/snapshots/SnapshotStoreConfig";
import { SnapshotSubscriberManagement } from '@/core/snapshots/SnapshotSubscriberManagement';

const API_BASE_URL = endpoints.snapshots


type SnapshotDataType<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> =
  | Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  | SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Map<string, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
  | Promise<{ snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> }> 
  | undefined;

type ItemUnion = ContentItem | K; // Assuming K extends Data


interface SnapshotBase<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseEntity<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
          SnapshotCategoryMethods // reuse the shared signatures
{
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  snapshotItems: ItemUnion[];
  contentItems?: ContentItem[];
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  timestamp: string | number | Date | undefined;
  currentcategory?: Category;
  snapshotId?: string | number | null;
  title?: string;
  tags?: string[] | TagsRecord<T>;
  key?: string;
  state?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  topic?: string;
  find: (id: string) => SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  version: string | Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  // other SnapshotBase members...
}


interface SnapshotContainerData<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  snapshotItems: ItemUnion[];
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>;
  timestamp?: string | number | Date;
  currentcategory?: Category;
  excludedFields?: ExcludedFields;
}

type SnapshotContainerType<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T,
> = Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;


interface SnapshotContainer<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends SnapshotBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotRelationships<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  SnapshotContainerData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  name?: string | undefined;
  category?: Category;
  mappedSnapshotData: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined;
  subscriberManagement?: SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  criteria: CriteriaType | undefined,
  content?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  snapshotCategory?: SnapshotCategory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotSubscriberId?: string | null | undefined;
  taskIdToAssign?: string;
  initialConfig: InitializedConfig | {};
  removeSubscriber: any;
  onError: (error: any) => void;
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null | undefined;
  snapshotsArray?: SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshotsObject?: SnapshotsObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  snapshots?: Snapshots<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  currentcategory?: Category;
  snapshotContent?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined; // Add snapshotContent if needed
  snapshotId?: string | number | null;
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null;
  snapshotContainer?: SnapshotContainerType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  createSnapshotData(params: {
    id: string | number | null;
    data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    // ... other parameters as an object
  }): Promise<SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  snapshotSubscriberManagement?: SnapshotSubscriberManagement<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
}

// Utility method to initialize properties of SnapshotContainer
function initializeSnapshotContainer <
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotContainer: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  initialValues: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  
  // Use spread operator for the cleanest approach
  return {
    ...snapshotContainer,
    ...initialValues
  } as SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
}

// Example of initializing SnapshotContainer within a method
function configureSnapshotContainer<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T  
>(
    container: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    config: Partial<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  // Use the initializeSnapshotContainer utility to set the properties
  return initializeSnapshotContainer(container, config);
}

export const snapshotContainer = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotId: string,
  storeId: number,
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | 
          Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
  snapConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    // Step 1: Resolve configuration
    const resolvedConfig = config instanceof Promise ? await config : config;
    if (!resolvedConfig) {
      throw new Error("SnapshotStoreConfig could not be resolved");
    }

    // Step 2: Create or fetch the snapshot manager
    const snapshotManager = createSnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();

    // Step 3: Initialize a snapshot store for this container
    const snapshotStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(resolvedConfig);

    // Step 4: Create the snapshot
    const baseData = (snapConfig?.data as T) || ({} as T);
    const baseMeta = snapConfig?.metaMap || new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
    const snapshot = await createCompleteSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      baseData,
      baseMeta,
      snapshotId,
      snapConfig?.category,
      snapshotStore,
      snapshotManager,
      resolvedConfig,
      true,
      snapConfig?.storeProps,
      snapConfig?.storeOptions
    );

    // Step 5: Build SnapshotContainer with the EXACT interface signature
    const container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: snapshotId,
      storeId,
      snapshot,
      store: snapshotStore,
      manager: snapshotManager,
      config: Promise.resolve(resolvedConfig), 
      initialized: true,
      getSnapshot: () => snapshot,
      getConfig: () => resolvedConfig,
      updateSnapshot: (
        snapshotId: string | number | null,
        snapshotIdOrParams: string | number | null | UpdateSnapshotParams<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        data: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
        newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        timestamp: Date,
        category?: Category,
        events?: Record<string, CalendarManagerStoreClass<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]>,
        snapshotStore?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        dataItems?: RealtimeDataItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        payloadData?: T | K,
        mappedSnapshotData?: Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
        delegate?: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        payload?: UpdateSnapshotPayload<T>,
        store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        callback?: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void,
        snapshotManager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
      ) => {
        // Handle the update based on parameter type
        if (typeof snapshotIdOrParams === 'object' && snapshotIdOrParams !== null && 'data' in snapshotIdOrParams) {
          // It's UpdateSnapshotParams
          const params = snapshotIdOrParams;
          
          // Update the snapshot with params.data (which is a Map)
          if (params.data) {
            // Merge data from the Map into the snapshot
            const mergedData = { ...snapshot.data };
            params.data.forEach((snap, key) => {
              if (snap.data) {
                Object.assign(mergedData, snap.data);
              }
            });
            snapshot.data = mergedData;
          }
          
          // Update timestamp if provided
          if (params.timestamp) {
            snapshot.timestamp = params.timestamp;
          }
          
          // Update other properties from params
          if (params.category) {
            category = params.category;
          }
          if (params.events) {
            events = params.events;
          }
        } else if (newData) {
          // Use newData if provided
          snapshot.data = { ...snapshot.data, ...newData.data };
          snapshot.timestamp = timestamp;
        }
        
        // Update category if provided
        if (category) {
          snapshot.category = category;
        }
        
        // Update the data map
        if (snapshotId && data) {
          data.set(String(snapshotId), snapshot);
        }
        
        // Update mappedSnapshotData if provided
        if (snapshotId && mappedSnapshotData) {
          mappedSnapshotData.set(String(snapshotId), snapshot);
        }
        
        // Handle events
        if (events) {
          Object.entries(events).forEach(([eventName, eventData]) => {
            console.log(`Snapshot update event: ${eventName}`, eventData);
          });
        }
        
        // Call callback if provided
        if (callback) {
          callback(snapshot);
        }
        
        return snapshot;
      },
    };

    return container;
  } catch (error) {
    console.error("Error creating snapshot container:", error);
    throw error;
  }
};

export type {
    ItemUnion, SnapshotBase,
    SnapshotContainer, SnapshotContainerData, SnapshotContainerType, SnapshotDataType
};

