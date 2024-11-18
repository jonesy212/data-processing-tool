// SnapshotCore.ts
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotStoreConfig';
import { InitializedState } from '@/app/components/projects/DataAnalysisPhase/DataProcessing/DataStore';
import { SchemaField } from './../database/SchemaField';
import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { CriteriaType } from '@/app/pages/searchs/CriteriaType';
import { Category } from '../libraries/categories/generateCategoryProperties';
import CalendarManagerStoreClass from '../state/stores/CalendarManagerStore';
import { Subscriber, SubscribeResult } from '../users/Subscriber';
import { Snapshots, SnapshotsArray, SnapshotUnion } from './LocalStorageSnapshotStore';
import { SnapshotConfig } from './SnapshotConfig';
import { SnapshotData } from './SnapshotData';
import { ExtendedVersionData } from '../versions/VersionData';


interface SnapshotCore<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
    initialState: InitializedState<T, K>;
    schema: Record<string, SchemaField>;
    versionInfo: ExtendedVersionData | null;
    isCore: boolean;
    taskIdToAssign: string | undefined;
    // Other core properties
  }


interface SnapshotStoreCore<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> {
  id: string;
  data: T[];
  createdAt: Date;
  updatedAt: Date;
  
  storeId: string | number;
  category: Category;
  criteria?: CriteriaType;
  snapshots?: Snapshots<T>;
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
    snapshots: SnapshotsArray<T>,
    callback: (
      snapshotStore: SnapshotStore<T, K>, 
      snapshots: SnapshotsArray<T>
    ) => Subscriber<T, K> | null,
   ) => SubscribeResult<T, K> | null;
  findIndex?(predicate: (snapshot: SnapshotUnion<T>) => boolean): number;
}


  export type { SnapshotCore, SnapshotStoreCore };
