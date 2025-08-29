// SnapshotCore.ts
import { BaseData } from '@/app/components/models/data/Data';
import { InitializedState } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import SnapshotStore from '@/app/components/snapshots/SnapshotStore';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { SchemaField } from '../../../server/database/SchemaField';
import { Category } from '../libraries/categories/generateCategoryProperties';
import CalendarManagerStoreClass from '../state/stores/CalendarManagerStore';
import { Subscriber, SubscribeResult } from '../users/Subscriber';
import { ExtendedVersionData } from '../versions/VersionData';
import { Snapshots, SnapshotsArray, SnapshotUnion } from './LocalStorageSnapshotStore';
import { SnapshotConfig } from './SnapshotConfig';
import { SnapshotData } from './SnapshotData';
import { InitializedData } from './SnapshotStoreOptions';
import { BaseEntity } from '../../../data_analysis/frontend/buddease/src/app/components/routing/FuzzyMatch';
import { BaseDataEntity, BaseDataRoot, DefaultMeta, DefaultExcludedFields } from '../../../data_analysis/frontend/buddease/src/app/configs/BaseConfig';
import { SharedMetadata } from '../../../data_analysis/frontend/buddease/src/app/configs/metadata/createMetadataState';
import { Snapshot } from './Snapshot';
import { SnapshotOperations } from './snapshotOperations';


interface SnapshotCore<T extends  BaseData<any>, K extends T = T, Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>> {
  initialState: InitializedState<T, K>;
  schema: Record<string, SchemaField>;
  versionInfo: ExtendedVersionData<T, K> | null;
  isCore: boolean;
  taskIdToAssign: string | undefined;
  // Other core properties
}

interface SnapshotData<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> {
  // Core properties
  core: SnapshotCore<T, K, Meta>;
  shared: SharedSnapshotProperties<T, K, ExcludedFields>;
  identity: SnapshotIdentity;
  metadata: SnapshotMetadata<T, K>;
  security: SnapshotSecurity;
  versioning: SnapshotVersioning<T, K, Meta>;
  storage: SnapshotStorage<T, K>;
  operations: SnapshotOperations<T, K>;
  methods: SnapshotMethodsInterface<T, K>;
  base: BaseEntity<T, K, Meta, ExcludedFields>;
  sharedMetadata: SharedMetadata<T, K, ExcludedFields>;
  
  // Flattened properties for convenience
  configOption?: string | SnapshotConfig<T, K> | SnapshotStoreConfig<T, K> | null;
  updatedAt?: string | Date;
  then?: (callback: (newData: Snapshot<T, K>) => void) => Snapshot<T, K> | undefined;
}

// Helper type for easy access
type FlattenedSnapshotData<T extends BaseDataEntity, K extends T = T> = 
  SnapshotData<T, K>['core'] &
  SnapshotData<T, K>['shared'] &
  SnapshotData<T, K>['identity'] &
  SnapshotData<T, K>['metadata'] &
  SnapshotData<T, K>['security'] &
  SnapshotData<T, K>['versioning'] &
  SnapshotData<T, K>['storage'] &
  SnapshotData<T, K>['operations'] &
  SnapshotData<T, K>['methods'] &
  SnapshotData<T, K>['base'] &
  SnapshotData<T, K>['sharedMetadata'] & {
    configOption?: string | SnapshotConfig<T, K> | SnapshotStoreConfig<T, K> | null;
    updatedAt?: string | Date;
    then?: (callback: (newData: Snapshot<T, K>) => void) => Snapshot<T, K> | undefined;
};  

interface SnapshotStoreCore<
  T extends BaseDataEntity, 
  K extends T = T, 
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>
> {
  id?: string | number | undefined;             
  data: InitializedData<T, K> | undefined;
  createdAt: Date;
  updatedAt: Date;
  
  storeId: string | number;
  category: Category;
  criteria?: CriteriaType;
  snapshots?: Snapshots<T, K>;
  timestamp?: string | number | Date | undefined;
  eventRecords?: Record<string, CalendarManagerStoreClass<T, K>[]>;
  
  snapshotConfig?: SnapshotConfig<T, K>[]; 
  callback: (data: T) => void;
  // Shared Methods
  subscribeToSnapshots: (
    snapshoStore: SnapshotStore<T, K>,
    snapshotId: string,
    snapshotData: SnapshotData<T, K>,
    category: Category | undefined,    snapshotConfig: SnapshotStoreConfig<T, K>,
    snapshots: SnapshotsArray<T, K, Meta>,
    callback: (
      snapshotStore: SnapshotStore<T, K>, 
      snapshots: SnapshotsArray<T, K, Meta>
    ) => Subscriber<T, K> | null,
   ) => SubscribeResult<T, K> | null;
  findIndex?(predicate: (snapshot: SnapshotUnion<T, K, Meta>) => boolean): number;
}


  export type { SnapshotCore, SnapshotStoreCore };
