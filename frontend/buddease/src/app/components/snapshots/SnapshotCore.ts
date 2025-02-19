import { SnapshotStore } from '@/app/components/snapshots/SnapshotStore';
// SnapshotCore.ts
import { BaseData } from '@/app/components/models/data/Data';
import { InitializedState } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { Category } from '../libraries/categories/generateCategoryProperties';
import CalendarManagerStoreClass from '../state/stores/CalendarManagerStore';
import { Subscriber, SubscribeResult } from '../users/Subscriber';
import { ExtendedVersionData } from '../versions/VersionData';
import { SchemaField } from './../database/SchemaField';
import { Snapshots, SnapshotsArray, SnapshotUnion } from './LocalStorageSnapshotStore';
import { SnapshotConfig } from './SnapshotConfig';
import { SnapshotData } from './SnapshotData';


interface SnapshotCore<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
    initialState: InitializedState<T, K>;
    schema: Record<string, SchemaField>;
    versionInfo: ExtendedVersionData | null;
    isCore: boolean;
    taskIdToAssign: string | undefined;
    // Other core properties
  }


interface SnapshotStoreCore<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  id?: string | number | undefined;             
  data: InitializedData<T> | undefined;
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
    category: symbol | string | Category | undefined,
    snapshotConfig: SnapshotStoreConfig<T, K>,
    snapshots: SnapshotsArray<T, K>,
    callback: (
      snapshotStore: SnapshotStore<T, K>, 
      snapshots: SnapshotsArray<T, K>
    ) => Subscriber<T, K> | null,
   ) => SubscribeResult<T, K> | null;
  findIndex?(predicate: (snapshot: SnapshotUnion<T, K>) => boolean): number;
}


  export type { SnapshotCore, SnapshotStoreCore };
