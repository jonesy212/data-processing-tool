import { K, T } from "../components/models/data/dataStoreMethods";
import { SnapshotData } from "../components/snapshots";

const snapshotCache: Map<string, SnapshotData<T, K<T>>> = new Map();
const getCachedSnapshotData = (snapshotId: string): SnapshotData<T, K<T>> | undefined => {
    // Check if the cache has data for the given snapshot ID
    if (snapshotCache.has(snapshotId)) {
      console.log(`Cache hit for snapshot ID: ${snapshotId}`);
      return snapshotCache.get(snapshotId);
    } else {
      console.log(`Cache miss for snapshot ID: ${snapshotId}`);
      return undefined;
    }
  };  


  
  const cacheSnapshotData = (snapshotId: string, data: SnapshotData<T, K<T>>): void => {
    snapshotCache.set(snapshotId, data);
    console.log(`Data cached for snapshot ID: ${snapshotId}`);
  };

  export { cacheSnapshotData, getCachedSnapshotData };
