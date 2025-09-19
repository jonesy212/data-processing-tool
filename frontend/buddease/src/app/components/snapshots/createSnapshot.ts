import { internalCache } from '@/app/utils/InternalCache';
import { defaultSnapshotBuilder } from './defaultSnapshotBuilder'
import { deepEqual } from 'assert';
import { Snapshot, SnapshotStoreConfig } from '.';
import { SnapshotsArray } from "./LocalStorageSnapshotStore";
import { SnapshotManager } from '../../../data_analysis/frontend/buddease/src/app/components/hooks/useSnapshotManager';
import { Category } from '../../../data_analysis/frontend/buddease/src/app/components/libraries/categories/generateCategoryProperties';
import { DataStore, InitializedState } from '../../../data_analysis/frontend/buddease/src/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '../../../data_analysis/frontend/buddease/src/app/configs/BaseConfig';
import { CategoryProperties } from '../../../data_analysis/frontend/buddease/src/app/pages/personas/ScenarioBuilder';
import { UtilMethods } from './methods/utilMethods';
import SnapshotStore from './SnapshotStore';
import { Callback } from './subscribeToSnapshotsImplementation';
import { SnapshotStoreOptions } from './useSnapshotStore';
import { SnapshotStoreProps } from './SnapshotStoreProps';
import UniqueIDGenerator from '../../../data_analysis/frontend/buddease/src/app/generators/GenerateUniqueIds';
import { performContentAnalysis } from '../../../data_analysis/frontend/buddease/src/app/components/models/data/EventContentAnalysis';

export const createBasicSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(config: {
  id: string;
  data: T;
  metadata: Meta;
  version?: string;
  category?: Category;
  categoryProperties?: CategoryProperties;
  initialState?: InitializedState<T, K, Meta, ExcludedFields>;
  isCore?: boolean;
  // Add other basic properties as needed
}): Snapshot<T, K, Meta, ExcludedFields> => {
  
  // Create a minimal snapshot with required properties
  const basicSnapshot: Partial<Snapshot<T, K, Meta, ExcludedFields>> = {
    id: config.id,
    data: config.data,
    metadata: config.metadata,
    version: config.version || '1.0',
    category: config.category,
    categoryProperties: config.categoryProperties,
    initialState: config.initialState,
    isCore: config.isCore || false,
    // Set defaults for required properties
    onInitialize: () => {},
    taskIdToAssign: null,
    schema: {},
    currentCategory: undefined,
    deleted: false,
    status: 'active' as const,
    meta: {
      ...config.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    },
    state: {} as SnapshotsArray<T, K, Meta, ExcludedFields>,
    dataStores: [],
    auditRecords: {} as Partial<Snapshot<T, K, Meta, ExcludedFields>>,
    subscribed: false,
  };

  return basicSnapshot as Snapshot<T, K, Meta, ExcludedFields>;
};export const enhanceSnapshotWithMethods = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  basicSnapshot: Snapshot<T, K, Meta, ExcludedFields>,
  snapshotManager?: SnapshotManager<T, K, Meta, ExcludedFields> | null
): Snapshot<T, K, Meta, ExcludedFields> => {
  
  // Create enhanced snapshot with methods
  const enhancedSnapshot = Object.create(Object.getPrototypeOf(basicSnapshot)) as Snapshot<T, K, Meta, ExcludedFields>;
  
  Object.assign(enhancedSnapshot, basicSnapshot, {
    // Custom methods
    equals(this: Snapshot<T, K, Meta, ExcludedFields>, other: Snapshot<T, K, Meta, ExcludedFields>) {
      return other?.id && this.id === other.id && deepEqual(this.data, other.data);
    },

    compareWith(
      this: Snapshot<T, K, Meta, ExcludedFields>,
      other: Snapshot<T, K, Meta, ExcludedFields>,
      options?: { compareData?: boolean }
    ) {
      return UtilMethods.compareSnapshots(this, other, options);
    },

    deepEquals(this: Snapshot<T, K, Meta, ExcludedFields>, other: Snapshot<T, K, Meta, ExcludedFields>) {
      return deepEqual(this.data, other.data);
    },

    manageSubscription(
      this: Snapshot<T, K, Meta, ExcludedFields>,
      snapId: string,
      callback: Callback<Snapshot<T, K, Meta, ExcludedFields>>
    ) {
      if (this.id === snapId) {
        callback(this);
        const subscribed = Object.create(Object.getPrototypeOf(this));
        Object.assign(subscribed, this, { isSubscribed: true });
        return subscribed;
      }
      return this;
    },

    get(this: Snapshot<T, K, Meta, ExcludedFields>, key: keyof T) {
      return this.data[key];
    },

    updateState(this: Snapshot<T, K, Meta, ExcludedFields>, state: any) {
      this.state = { ...this.state, ...state };
    },

    getCurrentState(this: Snapshot<T, K, Meta, ExcludedFields>) {
      return this.state;
    },

    getStores: () => snapshotManager?.getSnapshots() || [],

    initializeStores: (stores: DataStore<T, K, Meta>[]) => {
      snapshotManager?.initializeStores(stores);
    }
  });

  return enhancedSnapshot;
};

export const createAndAddSnapshot = createAsyncThunk(
  'snapshot/createAndAddSnapshot',
  async (entity: T, thunkAPI) => {
    try {
      const baseSnapshot = await createCompleteSnapshot<T, K, Meta, Attachment, ExcludedFields>(
        entity,
        new Map(),
        'mock-snapshot-id'
      );
      
      return baseSnapshot;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const createCompleteSnapshot = async <
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
>(
  baseData: T,
  baseMeta: Map<string, Snapshot<T, K, Meta, ExcludedFields>>,
  snapshotId: string | null,
  category: Category | undefined,
  snapshotStore: SnapshotStore<T, K, Meta, ExcludedFields> | null,
  snapshotManager: SnapshotManager<T, K, Meta, ExcludedFields> | null,
  snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, ExcludedFields> | null,
  isSubscribed: boolean = false,
  storeProps?: SnapshotStoreProps<T, K, Meta, ExcludedFields>,
  storeOptions?: SnapshotStoreOptions<T, K, Meta, ExcludedFields>
): Promise<Snapshot<T, K, Meta, ExcludedFields>> => {
  try {
    if (!storeProps) {
      throw new Error("storeProps is undefined");
    }
    const { prefix, name, type } = storeProps
    
    const id = snapshotId ? String(snapshotId) : UniqueIDGenerator.generateID(prefix, name, type)

    // Cache check
    const existingSnapshot = internalCache.get(id);
    if (existingSnapshot) {
      return existingSnapshot as Snapshot<T, K, Meta, ExcludedFields>;
    }

    // Build base snapshot using builder
    const builder = defaultSnapshotBuilder(baseData, baseMeta, storeProps, storeOptions);
    const { data: baseBuiltSnapshot } = await builder.buildBaseConfig();
    
    // Create basic snapshot from built data
    const basicSnapshot = createBasicSnapshot<T, K, Meta, ExcludedFields>({
      id,
      data: baseBuiltSnapshot.data,
      metadata: baseBuiltSnapshot.metadata,
      category,
      isCore: baseBuiltSnapshot.isCore,
      initialState: baseBuiltSnapshot.initialState,
      // Add other properties from baseBuiltSnapshot as needed
    });

    // Enhance with methods
    const enhancedSnapshot = enhanceSnapshotWithMethods<T, K, Meta, ExcludedFields>(
      basicSnapshot,
      snapshotManager
    );

    // Add store relationships
    const snapshotStores = new Map<number, SnapshotStore<T, K, Meta, ExcludedFields>>();
    if (snapshotStore) {
      snapshotStores.set(0, snapshotStore);
    }

    internalCache.set(id, enhancedSnapshot);
    return enhancedSnapshot;

  } catch (error) {
    console.error("Error creating complete snapshot:", error);
    throw error;
  }
};

export const createSnapshot = createCompleteSnapshot;
