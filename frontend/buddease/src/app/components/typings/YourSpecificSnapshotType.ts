import { Snapshot } from '../snapshots/LocalStorageSnapshotStore';
import { generateSnapshotId } from '../utils/snapshotUtils';
import SnapshotStore, { defaultCategory } from '../snapshots/SnapshotStore';
import { CategoryProperties } from '@/app/pages/personas/ScenarioBuilder';
import {  CommunicationType, CollaborationOption, CreationPhase, CryptoFeature, CryptoAction, CryptoInformation, CryptoCommunity, BlockchainCapability } from '@/app/typings/appTypes';
import { BaseData } from '../models/data/Data';

// Define YourSpecificSnapshotType implementing Snapshot<T>
class YourSpecificSnapshotType<T> implements Snapshot<T> {
    id: string;
    data: T;
  
    constructor(id: string, data: T) {
      this.id = id;
      this.data = data;
      // Additional initialization if necessary
    }
  
    // Implement methods required by Snapshot<T>
    getId(): string {
      return this.id;
    }
  
    setData(data: T): void {
      this.data = data;
      // Additional logic if necessary
    }
  }
  
  // Example usage:
  const specificSnapshot = new YourSpecificSnapshotType<string>('123', 'snapshot data');
  console.log(specificSnapshot.getId()); // Output: '123'
  specificSnapshot.setData('updated snapshot data');
  console.log(specificSnapshot.data); // Output: 'updated snapshot data'
  
  // Export the specific snapshot type if needed
  export { YourSpecificSnapshotType };


// Updated snapshotType using specific names
const snapshotType = <T extends BaseData>(
  snapshot: Snapshot<T>
): Snapshot<T> => {
  const newSnapshot = { ...snapshot };
  newSnapshot.id = snapshot.id || generateSnapshotId
  newSnapshot.title = snapshot.title || "";
  newSnapshot.timestamp = snapshot.timestamp ? new Date(snapshot.timestamp) : new Date();
  newSnapshot.subscriberId = snapshot.subscriberId || "";
  newSnapshot.category = typeof snapshot.category === "string" ? defaultCategory : snapshot.category || defaultCategory;
  newSnapshot.length = snapshot.length || 0;
  newSnapshot.content = snapshot.content || "";
  newSnapshot.data = snapshot.data;
  newSnapshot.value = snapshot.value || 0;
  newSnapshot.key = snapshot.key || "";
  newSnapshot.subscription = snapshot.subscription || null;
  newSnapshot.config = snapshot.config || null;
  newSnapshot.status = snapshot.status || "";
  newSnapshot.metadata = snapshot.metadata || {};
  newSnapshot.delegate = snapshot.delegate || [];
  newSnapshot.store = new SnapshotStore<T>(
    newSnapshot.initialState || null,
    (newSnapshot.category as CategoryProperties) || defaultCategory,
    newSnapshot.date ? new Date(newSnapshot.date) : new Date(),
    newSnapshot.type ? newSnapshot.type : "new snapshot",
    newSnapshot.snapshotConfig || [],
    newSnapshot.subscribeToSnapshots ? newSnapshot.subscribeToSnapshots : () => {},
    newSnapshot.delegate,
    newSnapshot.dataStoreMethods
  );
  newSnapshot.state = snapshot.state || null;
  newSnapshot.todoSnapshotId = snapshot.todoSnapshotId || "";
  newSnapshot.initialState = snapshot.initialState || null;
  return newSnapshot;
};



export { snapshotType };