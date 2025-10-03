import { Category } from '@/app/components/libraries/categories/generateCategoryProperties';
import { DataStore, InitializedState } from '@/app/projects/DataAnalysisPhase/DataProcessing/DataStore';
import UniqueIDGenerator from '@/app/generators/GenerateUniqueIds';
import { internalCache } from '@/app/utils/cache/InternalCache';
import { deepEqual } from 'assert';
import { SnapshotStoreConfig } from '.';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { SnapshotManager } from '@/app/hooks/useSnapshotManager';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import { defaultSnapshotBuilder } from './defaultSnapshotBuilder';
import { SnapshotsArray } from "./LocalStorageSnapshotStore";
import { UtilMethods } from './methods/utilMethods';
import SnapshotStore from './SnapshotStore';
import { SnapshotStoreProps } from './SnapshotStoreProps';
import { Callback } from './subscribeToSnapshotsImplementation';
import { SnapshotStoreOptions } from './useSnapshotStore';

export const createBasicSnapshot = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(config: {
  id: string;
  data: T;
  metadata: Meta;
  version?: string;
  category?: Category;
  categoryProperties?: CategoryProperties;
  initialState?: InitializedState<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  isCore?: boolean;
  // Add other basic properties as needed
}): Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  
  // Create a minimal snapshot with required properties
  const basicSnapshot: Partial<Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {
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
    state: {} as SnapshotsArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    dataStores: [],
    auditRecords: {} as Partial<Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
    subscribed: false,
  };

  return basicSnapshot as Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};



export const enhanceSnapshotWithMethods = <  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  basicSnapshot: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  snapshotManager?: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null
): Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  
  // Create enhanced snapshot with methods
  const enhancedSnapshot = Object.create(Object.getPrototypeOf(basicSnapshot)) as Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  
  Object.assign(enhancedSnapshot, basicSnapshot, {
    // Custom methods
    equals(this: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, other: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
      return other?.id && this.id === other.id && deepEqual(this.data, other.data);
    },

    compareWith(
      this: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      other: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      options?: { compareData?: boolean }
    ) {
      return UtilMethods.compareSnapshots(this, other, options);
    },

    deepEquals(this: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, other: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
      return deepEqual(this.data, other.data);
    },

    manageSubscription(
      this: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      snapId: string,
      callback: Callback<Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
    ) {
      if (this.id === snapId) {
        callback(this);
        const subscribed = Object.create(Object.getPrototypeOf(this));
        Object.assign(subscribed, this, { isSubscribed: true });
        return subscribed;
      }
      return this;
    },

    get(this: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, key: keyof T) {
      return this.data[key];
    },

    updateState(this: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, state: any) {
      this.state = { ...this.state, ...state };
    },

    getCurrentState(this: Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) {
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
      const baseSnapshot = await createCompleteSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
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
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  baseData: T,
  baseMeta: Map<string, Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
  snapshotId: string | null,
  category: Category | undefined,
  snapshotStore: SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshotManager: SnapshotManager<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  snapshotStoreConfig: SnapshotStoreConfig<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null,
  isSubscribed: boolean = false,
  storeProps?: SnapshotStoreProps<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  storeOptions?: SnapshotStoreOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
): Promise<Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> => {
  try {
    if (!storeProps) {
      throw new Error("storeProps is undefined");
    }
    const { prefix, name, type } = storeProps
    
    const id = snapshotId ? String(snapshotId) : UniqueIDGenerator.generateID(prefix, name, type)

    // Cache check
    const existingSnapshot = internalCache.get(id);
    if (existingSnapshot) {
      return existingSnapshot as Snapshott<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
    }

    // Build base snapshot using builder
    const builder = defaultSnapshotBuilder(baseData, baseMeta, storeProps, storeOptions);
    const { data: baseBuiltSnapshot } = await builder.buildBaseConfig();
    
    // Create basic snapshot from built data
    const basicSnapshot = createBasicSnapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
      id,
      data: baseBuiltSnapshot.data,
      metadata: baseBuiltSnapshot.metadata,
      category,
      isCore: baseBuiltSnapshot.isCore,
      initialState: baseBuiltSnapshot.initialState,
      // Add other properties from baseBuiltSnapshot as needed
    });

    // Enhance with methods
    const enhancedSnapshot = enhanceSnapshotWithMethods<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
      basicSnapshot,
      snapshotManager
    );

    // Add store relationships
    const snapshotStores = new Map<number, SnapshotStore<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>();
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
