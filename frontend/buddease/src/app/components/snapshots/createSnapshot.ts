import { BaseData } from "../models/data/Data";
import { StatusType } from "../models/data/StatusType";
import { Snapshot, Result } from "./LocalStorageSnapshotStore";
import SnapshotStore from "./SnapshotStore";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { InitializedData, InitializedDataStore, SnapshotStoreOptions } from "./SnapshotStoreOptions";
import { DataStoreMethods } from "../projects/DataAnalysisPhase/DataProcessing/ DataStoreMethods";

function createSnapshot<
  T extends BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
>(
  base: Snapshot<T, K, Meta>,
  extensions: Partial<SnapshotWithCriteria<T, K, Meta>> & {
    // Ensure required delegate properties are provided
    criteria: FilterCriteria;
    delegate: InitializedDelegate<T, K>;
    timestamp?: string | number | Date;
  }
): SnapshotWithCriteria<T, K, Meta> {
  // Create prototype chain
  const snapshot = Object.create(Object.getPrototypeOf(base)) as SnapshotWithCriteria<T, K, Meta>;

  // Default delegate properties
  const defaultDelegateProps = {
    criteria: extensions.criteria || { filters: [], sort: [] },
    delegate: extensions.delegate || {
      fetch: async () => [],
      transform: (data: T[]) => data,
      validate: (data: T) => true
    },
    timestamp: extensions.timestamp || new Date(),
    events: {},
    subscribers: [],
    tags: [],
    snapshots: new Map()
  };

  // Merge base, defaults, and extensions
  return Object.assign(
    snapshot, 
    base,
    defaultDelegateProps,
    extensions,
    {
      // Ensure these methods are properly bound
      getStores: function(this: SnapshotWithCriteria<T, K, Meta>) {
        return this.delegate.fetch().then(data => 
          data.map(d => createSnapshot(base, { ...d, delegate: this.delegate }))
        )
      },
      applyCriteria: function(this: SnapshotWithCriteria<T, K, Meta>, criteria: FilterCriteria) {
        this.criteria = criteria;
        return this.getStores();
      }
    }
  );
}


export { createSnapshot }