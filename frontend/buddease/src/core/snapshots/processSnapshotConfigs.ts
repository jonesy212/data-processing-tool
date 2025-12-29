// processSnapshotConfigs.ts
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { Category } from '@/core/libraries/categories/generateCategoryProperties';
import { Data } from '@/core/models/data/Data';
import { CategoryProperties } from '@/core/pages/personas/ScenarioBuilder';
import { FetchSnapshotPayload } from '@/core/snapshots/FetchSnapshotPayload';
import SnapshotStore from '@/core/snapshots/SnapshotStore';
import { SnapshotStoreConfig, snapshotStoreConfigs } from '@/core/snapshots/SnapshotStoreConfig';
import { SnapshotWithCriteria } from '@/core/snapshots/SnapshotWithCriteria';
import { decompress } from "@/utils/compression"; // hypothetical decompression utility


const processSnapshotConfigs = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>() => {
  for (const config of snapshotStoreConfigs) {
    // Example of processing each configuration
    console.log(`Processing snapshot configuration for snapshotId: ${config.snapshotId}`);


    // Example of calling fetchSnapshot function
    const snapshotStore = await config.fetchSnapshot(
      async (
        snapshotId: string,
        payload: FetchSnapshotPayload<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
        payloadData: Data<T> | T,
        categoryProperties: CategoryProperties | undefined, 
        timestamp: Date, 
        data: T,
        delegate: SnapshotWithCriteria<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
        category?: Category, 
      ) => {
        // Handle the callback logic here
        return {
          snapshot: snapshotStore.snapshots[0], // Assuming the snapshot is available
        };
      }
    );

    // Example of clearing snapshots
    config.clearSnapshots();

    // Additional logic depending on your needs...
  }
};

processSnapshotConfigs();




// Properly typed handleTags function
const handleTags = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  if (!config.tags) return;

  for (const tagId of Object.keys(config.tags)) {
    const tag = config.tags[tagId];
    if (!tag) continue;

    // Process each tag
    console.log(`Handling tag: ${tag.name}, color: ${tag.color}`);
  }
};

// Properly typed processSnapshotRelationships function
const processSnapshotRelationships = <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  config: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
) => {
  if (!config.snapshots || config.snapshots.length === 0) return;

  const snapshot = config.snapshots[0];

  const parentId = config.configOption?.getParentId
    ? config.configOption.getParentId(snapshot)
    : undefined;
  console.log(`Parent ID: ${parentId}`);

  const childIds = config.configOption?.getChildIds
    ? config.configOption.getChildIds(snapshot)
    : [];
  console.log(`Child IDs: ${childIds.join(", ")}`);
};


async function resolveConfig<
    T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(core: SnapshotCoreBase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
  return core.config instanceof Promise ? await core.config : core.config;
}

const initializeSnapshotStoreConfig = async <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  rawConfig:
    | SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
    | Promise<SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null>
    | string
) => {
  const config = await resolveConfig(rawConfig);

  if (!config) throw new Error("Failed to resolve SnapshotStoreConfig");

  // 🔹 Handle compressed snapshot
  if (config.isCompressed && config.compressedData) {
    console.log("Decompressing snapshot store...");

    try {
      // Example: compressedData is base64 string of zipped JSON
      const jsonString = decompress(config.compressedData); // returns string
      const decompressedStore = JSON.parse(jsonString);

      // Replace the store in the config with decompressed data
      config.store = decompressedStore;
      console.log("Snapshot store decompressed successfully.");
    } catch (error) {
      console.error("Failed to decompress snapshot store:", error);
      throw error;
    }
  }

  console.log(`Initializing snapshot store for: ${config.snapshotId}`);

  const snapshotStore = await config.fetchSnapshot(
    async (
      snapshotId,
      payload,
      snapshotStore,
      payloadData,
      categoryProperties,
      timestamp,
      data,
      delegate,
      category
    ) => {
      return {
        snapshot: snapshotStore.snapshots[0],
      };
    }
  );

  return snapshotStore;
};

  

const processAllSnapshotConfigs = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotStoreConfigs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {

  const initializedStores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

  for (const config of snapshotStoreConfigs) {
    try {
      // Handle compressed snapshots
      if (config.isCompressed) {
        if (config.compressedData) {
          console.log(`Decompressing snapshot store: ${config.snapshotId}`);
          config.data = decompress(config.compressedData) as any; // Cast to appropriate Data<T, K, ...> type
        } else {
          console.warn(`Config ${config.snapshotId} marked as compressed but no compressedData found`);
        }
      }

      // Initialize snapshot store
      const snapshotStore = await initializeSnapshotStoreConfig(config);

      // Add to list for return
      initializedStores.push(snapshotStore);

      console.log(`Initialized snapshot store: ${config.snapshotId}`);
    } catch (err) {
      console.error(`Failed to initialize snapshot store ${config.snapshotId}:`, err);
    }
  }

  return initializedStores;
};


processAllSnapshotConfigs();
  



const processAllSnapshotConfigsParallel = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotStoreConfigs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {

  // Map each config to a promise
  const storePromises = snapshotStoreConfigs.map(async (config) => {
    try {
      // Handle compressed snapshots
      if (config.isCompressed && config.compressedData) {
        console.log(`Decompressing snapshot store: ${config.snapshotId}`);
        config.data = decompress(config.compressedData) as any; // Cast to correct Data<T, K, ...> type
      }

      // Initialize snapshot store
      const snapshotStore = await initializeSnapshotStoreConfig(config);

      console.log(`Initialized snapshot store: ${config.snapshotId}`);
      return snapshotStore;
    } catch (err) {
      console.error(`Failed to initialize snapshot store ${config.snapshotId}:`, err);
      return null; // Keep the array length consistent, filter out later
    }
  });

  // Wait for all snapshot store promises to resolve
  const resolvedStores = await Promise.all(storePromises);

  // Filter out failed initializations
  return resolvedStores.filter(
    (store): store is SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => store !== null
  );
};



export const initializeAllSnapshotStores = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotStoreConfigs: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[],
  dataStoreMethods: DataStoreMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {

  const storePromises = snapshotStoreConfigs.map(async (config) => {
    try {
      // Step 1: Decompress if compressed
      if (config.isCompressed && config.compressedData) {
        console.log(`Decompressing snapshot store: ${config.snapshotId}`);
        config.data = decompress(config.compressedData) as any; // Cast to Data<T, K, ...>
      }

      // Step 2: Process tags if present
      if (config.tags) {
        Object.values(config.tags).forEach(tag => {
          console.log(`Processing tag: ${tag.name}, color: ${tag.color}`);
        });
      }

      // Step 3: Process snapshot relationships
      if (config.snapshots && config.configOption) {
        const snapshot = config.snapshots[0]; // first snapshot as example
        const parentId = config.configOption.getParentId(snapshot);
        console.log(`Parent ID: ${parentId}`);

        const childIds = config.configOption.getChildIds(snapshot);
        console.log(`Child IDs: ${childIds.join(', ')}`);
      }

      // Step 4: Initialize the snapshot store
      const snapshotStore = await initializeSnapshotStoreConfig(config);

      // Step 5: Optionally, perform further store initialization
      if (snapshotStore) {
        console.log(`Snapshot store initialized: ${config.snapshotId}`);
        // e.g., link criteria, assign tasks, or run custom hooks
      }

      return snapshotStore;
    } catch (err) {
      console.error(`Failed to initialize snapshot store ${config.snapshotId}:`, err);
      return null; // Keep array length consistent
    }
  });

  // Step 6: Wait for all snapshot store promises
  const resolvedStores = await Promise.all(storePromises);

  // Step 7: Filter out any failed initializations
  return resolvedStores.filter(
    (store): store is SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => store !== null
  );
};
