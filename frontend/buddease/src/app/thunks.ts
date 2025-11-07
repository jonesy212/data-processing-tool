import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { useDataStore } from '@/app/state/stores/DataStore';
import { createAsyncThunk } from "@reduxjs/toolkit";

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from "@/app/documents/attachment/Attachment";
import { SimulatedDataSource } from '@/app/snapshots/createSnapshotOptions';
import { Snapshot } from "@/app/snapshots/Snapshot";
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';
import SnapshotStore from "@/app/snapshots/SnapshotStore";
import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";

// --- Enhanced delegate helper with SimulatedDataSource support ---
async function getDelegate<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource?: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotStoreConfigs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    criteria?: any;
    category?: string;
    storeId?: number;
  }
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
  if (context.useSimulatedDataSource && context.simulatedDataSource) {
    // Use SimulatedDataSource to fetch and create stores
    const config = await context.simulatedDataSource.fetchData();
    return [new SnapshotStore(config)];
  }
  
  if (context.snapshotStoreConfigs) {
    // Create stores from provided configs
    return context.snapshotStoreConfigs.map(cfg => new SnapshotStore(cfg));
  }
  
  // ✅ ACTUAL API LOGIC USING YOUR SNAPSHOTAPI
  try {
    const { snapshotApi } = await import('./api/SnapshotApi');
    const snapshotStoreConfig = useDataStore().snapshotStoreConfig

    // Option 1: Fetch all snapshots and convert to stores
    if (context.criteria || context.category) {
      const snapshots = await snapshotApi.fetchAll<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
        criteria: {
          category: context.category,
          ...context.criteria
        }
      });
      
      // Convert Snapshots to SnapshotStores
      const stores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
      
      if (snapshots instanceof Map) {
        // Handle Map of snapshots
        for (const [key, snapshot] of snapshots.entries()) {
          const storeConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
            ...snapshotStoreConfig,
            storeId: context.storeId || parseInt(key as string) || 0,
            snapshotId: snapshot.id?.toString() || key.toString(),
            data: snapshot.data,
            metadata: snapshot.metadata,
            category: context.category || 'default',
            timestamp: new Date(),
            subscribers: [],
            // Map other required properties from your SnapshotStoreConfig
            initialState: snapshot.initialState,
            isCore: snapshot.isCore,
            versionInfo: snapshot.versionInfo
          };
          stores.push(new SnapshotStore(storeConfig));
        }
      } else if (Array.isArray(snapshots)) {
        // Handle array of snapshots
        stores.push(...snapshots.map(snapshot => {
          const storeConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
            ...snapshotStoreConfig,
            storeId: context.storeId || 0,
            snapshotId: snapshot.id?.toString() || UniqueIDGenerator.generateID(),
            data: snapshot.data,
            metadata: snapshot.metadata,
            category: context.category || 'default',
            timestamp: new Date(),
            subscribers: [],
            initialState: snapshot.initialState,
            isCore: snapshot.isCore,
            snapConfig: snapshot.snapConfig,
            versionInfo: snapshot.versionInfo
          };
          return new SnapshotStore(storeConfig);
        }));
      }
      
      return stores;
    }
    
    // Option 2: Fetch specific snapshot stores by criteria
    if (context.storeId) {
      const snapshotStore = await snapshotApi.getSnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
        context.storeId,
        {} as SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, // You'll need a proper container
        context.storeId,
        context.criteria || {},
        async () => ({}) as any // snapshotFunction would need to be provided
      );
      
      return snapshotStore ? [snapshotStore] : [];
    }
    
    // Option 3: Use findSnapshotStoresById for specific IDs
    if (context.criteria?.ids) {
      const stores: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];
      
      for (const id of context.criteria.ids) {
        const snapshotStores = await findSnapshotStoresById<T, K>(id);
        if (snapshotStores) {
          stores.push(...snapshotStores.map(container => {
            const storeConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
              storeId: id,
              snapshotId: container.id?.toString() || id.toString(),
              data: container.data,
              metadata: container.metadata,
              category: container.currentCategory || 'default',
              timestamp: container.timestamp || new Date(),
              subscribers: container.subscribers || [],
              initialState: container.data,
              isCore: true,
              snapConfig: container.config
            };
            return new SnapshotStore(storeConfig);
          }));
        }
      }
      
      return stores;
    }
    
    // Option 4: Fallback - fetch all available stores
    const allSnapshots = await snapshotApi.fetchAll<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>();
    const defaultStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
      ...snapshotStoreConfig,
        storeId: context.storeId || 0,
      snapshotId: 'default',
      data: {} as T,
      metadata: {} as Meta,
      category: 'default',
      timestamp: new Date(),
      subscribers: [],
      initialState: {} as T,
      isCore: true
    };
    
    return [new SnapshotStore(defaultStoreConfig)];
    
  } catch (error) {
    console.error('Failed to fetch data stores from SnapshotApi:', error);
    
      
    // Fallback to empty array or provide default store
    const fallbackStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    ...snapshotStoreConfig,
      storeId: context.storeId || 0,
      snapshotId: 'fallback',
      data: {} as T,
      metadata: {} as Meta,
      category: 'fallback',
      timestamp: new Date(),
      subscribers: [],
      initialState: {} as T,
      isCore: false
    };
    
    return [new SnapshotStore(fallbackStoreConfig)];
  }
}

// Helper function to convert your existing findSnapshotStoresById to work with generics
async function findSnapshotStoresById<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(id: number): Promise<SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | undefined> {
  try {
    const { snapshotApi } = await import('./api/SnapshotApi');
    
    // Use your existing fetchSnapshotStoreData function
    const container = await snapshotApi.fetchSnapshotStoreData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      id.toString()
    );
    
    return container ? [container] : undefined;
  } catch (error) {
    console.error(`Failed to find snapshot stores by ID ${id}:`, error);
    return undefined;
  }
}

// Enhanced version with error handling and retry logic
async function getDelegateWithRetry<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  context: {
    useSimulatedDataSource: boolean;
    simulatedDataSource?: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    snapshotStoreConfigs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    criteria?: any;
    category?: string;
    storeId?: number;
  },
  retryCount: number = 3
): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> {
  try {
    return await getDelegate(context);
  } catch (error) {
    if (retryCount > 0) {
      console.log(`Retrying getDelegate, ${retryCount} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
      return await getDelegateWithRetry(context, retryCount - 1);
    }
    throw error;
  }
}


// --- Enhanced API helper using your existing SnapshotApi ---
async function saveSnapshotToAPI<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Promise<void> {
  try {
    // Use your existing SnapshotApi instance
    const { snapshotApi } = await import('@/app/api/SnapshotApi');
    await snapshotApi.create(snapshot);
  } catch (error) {
    console.error('Failed to save snapshot to API:', error);
    throw error;
  }
}

// ✅ Generic thunk to fetch data stores with SimulatedDataSource support
export const fetchDataStores = createAsyncThunk(
  "snapshot/fetchDataStores",
  async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    context: {
      useSimulatedDataSource: boolean;
      simulatedDataSource?: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshotStoreConfigs?: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
    }
  ): Promise<SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]> => {
    return await getDelegate(context);
  }
);


/**
 * ✅ Enhanced async thunk for creating and adding a snapshot with SimulatedDataSource support
 */
export const createAndAddSnapshot = createAsyncThunk(
  "snapshot/createAndAddSnapshot",
  async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    params: {
      data: T;
      store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      meta?: Meta;
      attachments?: AttachmentType[];
      notifySubscribers?: boolean;
      persist?: boolean;
      simulatedDataSource?: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      // Additional options for enhanced functionality
      category?: string;
      projectId?: string;
      projectType?: any; // Replace with your actual ProjectType
      projectState?: any; // Replace with your actual ProjectStateEnum
      projectMembers?: any[]; // Replace with your actual Member type
    },
    { rejectWithValue }
  ): Promise<
    Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  > => {
    try {
      const {
        data,
        store,
        meta,
        attachments,
        notifySubscribers = true,
        persist = false,
        simulatedDataSource,
        category,
        projectId,
        projectType,
        projectState,
        projectMembers
      } = params;

      // Use simulated data source if provided
      let enhancedData = data;
      let enhancedMeta = meta;
      
      if (simulatedDataSource) {
        console.log('Using simulated data source:', simulatedDataSource.name);
        const simulatedConfig = await simulatedDataSource.fetchData();
        
        // Enhance data with simulated configuration
        enhancedData = {
          ...data,
          ...simulatedConfig.data
        } as T;
        
        enhancedMeta = {
          ...meta,
          simulatedSource: simulatedDataSource.name,
          simulatedAt: new Date().toISOString(),
          ...simulatedConfig.metadata
        } as Meta;
      }

      // ✅ Generate a unique snapshot ID
      const snapshotId = UniqueIDGenerator.generateID();

      // ✅ Create a snapshot instance using your existing Snapshot constructor pattern
      const newSnapshot = new Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
        id: snapshotId,
        data: enhancedData,
        meta: enhancedMeta,
        attachments,
        storeId: store?.getStoreId?.() ?? 0,
        timestamp: new Date().toISOString(),
        // Include additional properties from your existing Snapshot structure
        category: category || 'default',
        projectId,
        projectType,
        projectState,
        projectMembers,
        // Add other required properties from your Snapshot class
        initialState: enhancedData,
        isCore: true,
        subscribers: [],
        snapshotStore: store || null
      });

      // ✅ Persist if requested using your existing API
      if (persist) {
        await saveSnapshotToAPI(newSnapshot);
      }

      // ✅ Notify subscribers (if store supports it)
      if (notifySubscribers && store) {
        const notifyFn = store.getNotifier?.();
        if (notifyFn) {
          notifyFn(newSnapshot);
        } else {
          // Fallback to your subscription service
          const { subscriptionServiceInstance } = await import('@/app/hooks/dynamicHooks/dynamicHooks');
          subscriptionServiceInstance.notify("snapshotAdded", newSnapshot);
        }
      }

      // If using simulated data source, trigger its callback
      if (simulatedDataSource?.callback) {
        simulatedDataSource.callback(newSnapshot);
      }

      return newSnapshot;
    } catch (err) {
      console.error('Error in createAndAddSnapshot:', err);
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to create snapshot"
      ) as any;
    }
  }
);

/**
 * ✅ Thunk for batch snapshot operations
 */
export const batchCreateSnapshots = createAsyncThunk(
  "snapshot/batchCreateSnapshots",
  async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    params: {
      snapshots: Array<{
        data: T;
        meta?: Meta;
        attachments?: AttachmentType[];
        category?: string;
      }>;
      store?: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      simulatedDataSource?: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      persist?: boolean;
    },
    { rejectWithValue }
  ): Promise<
    Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]
  > => {
    try {
      const { snapshots, store, simulatedDataSource, persist = false } = params;

      const createdSnapshots: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] = [];

      for (const snapshotParams of snapshots) {
        const snapshot = await createAndAddSnapshot({
          ...snapshotParams,
          store,
          simulatedDataSource,
          persist,
          notifySubscribers: false // Batch notify at the end
        });

        createdSnapshots.push(snapshot);
      }

      // Notify once for all snapshots
      if (store) {
        const notifyFn = store.getNotifier?.();
        if (notifyFn) {
          notifyFn(createdSnapshots);
        }
      }

      return createdSnapshots;
    } catch (err) {
      return rejectWithValue(
        err instanceof Error ? err.message : "Failed to create batch snapshots"
      ) as any;
    }
  }
);

/**
 * ✅ Thunk for snapshot operations with error handling and retry logic
 */
export const executeSnapshotOperation = createAsyncThunk(
  "snapshot/executeOperation",
  async <
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    params: {
      operation: 'create' | 'update' | 'delete' | 'fetch';
      snapshot?: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      snapshotId?: string;
      data?: Partial<T>;
      simulatedDataSource?: SimulatedDataSource<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
      retryCount?: number;
    },
    { rejectWithValue, dispatch }
  ): Promise<any> => {
    try {
      const { operation, snapshot, snapshotId, data, simulatedDataSource, retryCount = 3 } = params;

      // Use simulated data source for operations if provided
      if (simulatedDataSource) {
        console.log(`Executing ${operation} operation with simulated data source:`, simulatedDataSource.name);
        
        switch (operation) {
          case 'create':
            if (!snapshot) throw new Error('Snapshot required for create operation');
            return await dispatch(createAndAddSnapshot({
              data: snapshot.data,
              meta: snapshot.meta,
              attachments: snapshot.attachments,
              simulatedDataSource,
              persist: true
            })).unwrap();
            
          case 'fetch':
            if (!snapshotId) throw new Error('Snapshot ID required for fetch operation');
            // Use your existing SnapshotApi for fetch operations
            const { snapshotApi } = await import('@/app/api/SnapshotApi');
            return await snapshotApi.fetchById(snapshotId, 0); // storeId would need to be provided
            
          default:
            throw new Error(`Operation ${operation} not supported with simulated data source`);
        }
      }

      // Fall back to actual API operations
      const { snapshotApi } = await import('@/app/api/SnapshotApi');
      
      switch (operation) {
        case 'create':
          if (!snapshot) throw new Error('Snapshot required for create operation');
          return await snapshotApi.create(snapshot);
          
        case 'fetch':
          if (!snapshotId) throw new Error('Snapshot ID required for fetch operation');
          return await snapshotApi.fetchById(snapshotId, 0); // storeId would need to be provided
          
        case 'update':
          if (!snapshotId || !data) throw new Error('Snapshot ID and data required for update operation');
          // Implementation would depend on your update method signature
          throw new Error('Update operation not fully implemented');
          
        case 'delete':
          if (!snapshot) throw new Error('Snapshot required for delete operation');
          return await snapshotApi.delete(snapshot as any); // Type adjustment needed
          
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (err) {
      console.error(`Snapshot operation ${params.operation} failed:`, err);
      
      // Simple retry logic
      if (params.retryCount > 0) {
        console.log(`Retrying operation, ${params.retryCount} attempts remaining`);
        return await dispatch(executeSnapshotOperation({
          ...params,
          retryCount: params.retryCount - 1
        })).unwrap();
      }
      
      return rejectWithValue(
        err instanceof Error ? err.message : `Failed to execute ${params.operation} operation`
      );
    }
  }
);