// SnapshotContainer.ts
import { endpoints } from "@/app/api/endpointConfigurations";
import { SnapshotCategory } from "@/app/api/getSnapshotEndpoint";
import { ContentItem } from '@/app/cards/DummyCardLoader';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SnapshotManager } from "@/app/hooks/useSnapshotManager";
import { Category, SnapshotCategoryMethods } from '@/app/libraries/categories/generateCategoryProperties';
import { Content } from "@/app/models/content/AddContent";
import { Data } from '@/app/models/data/Data';
import { CriteriaType } from '@/app/pages/searches/CriteriaType';
import { SharedMetadata } from '@/app/shared/SharedMetadata';
import { createCompleteSnapshot } from '@/app/snapshots/createSnapshot';
import { Snapshots, SnapshotsArray, SnapshotsObject } from '@/app/snapshots/LocalStorageSnapshotStore';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { Version } from "@/app/versions/Version";

import { BaseDataEntity, BaseEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { TagsRecord } from '@/app/models/tracker/Tag';
import { SnapshotConfig } from "@/app/snapshots/SnapshotConfig";
import { SnapshotData, SnapshotRelationships } from "@/app/snapshots/SnapshotData";
import { SnapshotMethods } from "@/app/snapshots/SnapshotMethods";
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { InitializedConfig, SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
import { SnapshotSubscriberManagement } from '@/app/snapshots/SnapshotSubscriberManagement';

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
  config: Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>,
  snapConfig?: SnapshotConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    // Step 1: Resolve configuration
    const resolvedConfig = await config;
    if (!resolvedConfig) {
      throw new Error("SnapshotStoreConfig could not be resolved");
    }

    // Step 2: Create or fetch the snapshot manager
    const snapshotManager = new SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();

    // Step 3: Initialize a snapshot store for this container
    const snapshotStore = new SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(resolvedConfig);

    // Step 4: Create the snapshot using your reusable builder
    const baseData = snapConfig?.data || ({} as T);
    const baseMeta = snapConfig?.metaMap || new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
    const snapshot = await createCompleteSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      baseData,
      baseMeta,
      snapshotId,
      snapConfig?.category,
      snapshotStore,
      snapshotManager,
      resolvedConfig,
      true, // subscribed by default
      snapConfig?.storeProps,
      snapConfig?.storeOptions
    );

    // Step 5: Build SnapshotContainer
    const container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      id: snapshotId,
      storeId,
      snapshot,
      store: snapshotStore,
      manager: snapshotManager,
      config: resolvedConfig,
      initialized: true,
      getSnapshot: () => snapshot,
      getConfig: () => resolvedConfig,
      updateSnapshot: (snapshotId: string | number | null, updatedData: Partial<T>) => {
        snapshot.data = { ...snapshot.data, ...updatedData };
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

