// SnapshotConfig.ts
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { Data } from "../models/data/Data";
import { NotificationType } from "../support/NotificationContext";
import SnapshotStore, { Snapshot } from "./SnapshotStore";

// SnapshotStoreConfig.tsx
interface SnapshotStoreConfig<T> {
  clearSnapshots: any;
  key: string;
  initialState: T;
  
  snapshot: (
    snapshot: SnapshotStore<Snapshot<Data>>[]
  ) => Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }>;
  subscribers: SnapshotStore<Snapshot<Data>>[];
  snapshots: { snapshot: SnapshotStore<Snapshot<Data>> }[];

  createSnapshot: (additionalData: any) => void;
  configureSnapshotStore: (
    snapshot: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
  ) => void;
  createSnapshotSuccess: () => void; // No need for snapshot reference
  createSnapshotFailure: (error: Error) => void; // No need for snapshot reference
  batchTakeSnapshot: (snapshots: SnapshotStore<Snapshot<Data>>[]) => Promise<{
    snapshot: SnapshotStore<Snapshot<Data>>;
  }>;

  onSnapshot?: (snapshot: SnapshotStore<Snapshot<Data>>) => void;
  snapshotData: (snapshot: SnapshotStore<Snapshot<Data>>) => {
    snapshot: SnapshotStore<Snapshot<Data>>[];
  };
  initSnapshot: () => void;
  clearSnapshot: () => void;

  updateSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => Promise<{
    snapshot: SnapshotStore<Snapshot<Data>>[];
  }>;
  getSnapshots: () => Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }[]>;
  takeSnapshot: (snapshot: SnapshotStore<Snapshot<Data>>) => Promise<{
    snapshot: SnapshotStore<Snapshot<Data>>[];
  }>;

  // Updated signature for getSnapshots method
  getSnapshot: (
    snapshot: SnapshotStore<Snapshot<Data>>
  ) => Promise<SnapshotStore<Snapshot<Data>>>;

  getAllSnapshots: (
    data: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => Promise<SnapshotStore<Snapshot<Data>>[]>
  ) => Promise<SnapshotStore<Snapshot<Data>>[]>; // Corrected return type

  // Adjusted method signatures for consistency
  takeSnapshotSuccess: () => void; // No need for snapshot reference
  updateSnapshotFailure: (payload: { error: string }) => void; // No need for snapshot reference
  takeSnapshotsSuccess: (snapshots: SnapshotStore<Snapshot<Data>>[]) => void;

  // No need for snapshot reference in the following functions
  fetchSnapshot: () => void;
  updateSnapshotSuccess: () => void;
  updateSnapshotsSuccess: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshot: SnapshotStore<Snapshot<Data>>[]
    ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
  ) => void;

  fetchSnapshotSuccess: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshot: SnapshotStore<Snapshot<Data>>[]
    ) => { snapshot: SnapshotStore<Snapshot<Data>>[] }
  ) => void;

  //BATCH METHODS

  batchUpdateSnapshots: (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshot: SnapshotStore<Snapshot<Data>>[]
  ) => Promise<
    {
      snapshot: SnapshotStore<Snapshot<Data>>[];
    }[]
    >;
  
    batchTakeSnapshotsRequest: (
      snapshotData: any
    ) => Promise<{
      snapshots: SnapshotStore<Snapshot<Data>>[];
    }>

  batchUpdateSnapshotsSuccess: (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => {
    snapshots: SnapshotStore<Snapshot<Data>>[];
  }[];

  batchFetchSnapshotsRequest: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => {
      subscribers: SnapshotStore<Snapshot<Data>>[];
      snapshots: SnapshotStore<Snapshot<Data>>[];
    }
  ) => (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => {
    subscribers: SnapshotStore<Snapshot<Data>>[];
    snapshots: SnapshotStore<Snapshot<Data>>[];
  };

  batchUpdateSnapshotsRequest: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => {
      subscribers: SnapshotStore<Snapshot<Data>>[];
      snapshots: SnapshotStore<Snapshot<Data>>[];
    }
  ) => {
    subscribers: SnapshotStore<Snapshot<Data>>[];
    snapshots: SnapshotStore<Snapshot<Data>>[];
  };

  batchFetchSnapshots(
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ): Promise<{}>;

  batchFetchSnapshotsSuccess: (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => SnapshotStore<Snapshot<Data>>[];

  batchFetchSnapshotsFailure: (payload: { error: Error }) => void;
  batchUpdateSnapshotsFailure: (payload: { error: Error }) => void;
  notifySubscribers: (
    subscribers: SnapshotStore<Snapshot<Data>>[]
  ) => SnapshotStore<Snapshot<Data>>[];
  [Symbol.iterator]: () => IterableIterator<Snapshot<T>>;
  notify: (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ) => void;


  [Symbol.asyncIterator]: () => AsyncIterableIterator<Snapshot<T>>;
}

const generateSnapshotId = UniqueIDGenerator.generateSnapshotID();
// Define the snapshot configuration object
const snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>[]> = {
  clearSnapshots: undefined,
  key: "teamSnapshotKey",
  initialState: {} as SnapshotStore<Snapshot<Data>>[],
  snapshots: [],
  initSnapshot: () => { },

  updateSnapshot: async (
    snapshot: SnapshotStore<Snapshot<Data>>
  ): Promise<{
    snapshot: SnapshotStore<Snapshot<Data>>[];
  }> => {
    try {
      snapshot.update({
        id: generateSnapshotId,
        data: {
          ...snapshot.data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date(),
      });

      return {
        snapshot: [snapshot],
      };
    } catch (error) {
      throw error;
    }
  },

  getAllSnapshots: (
    data: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => Promise<SnapshotStore<Snapshot<Data>>[]>
  ): Promise<SnapshotStore<Snapshot<Data>>[]> => {
    try {
      return new Promise<SnapshotStore<Snapshot<Data>>[]>((resolve, reject) => {
        Promise.resolve(snapshotConfig.snapshots);
      });
    } catch (error) {
      throw error;
    }
  },
  clearSnapshot: () => { },
  configureSnapshotStore: () => { },
  takeSnapshotSuccess: () => { },
  updateSnapshotFailure: () => { },
  takeSnapshotsSuccess: () => { },
  fetchSnapshot: () => { },
  updateSnapshotSuccess: () => { },
  updateSnapshotsSuccess: () => { },
  fetchSnapshotSuccess: () => { },
  createSnapshotSuccess: () => { },
  createSnapshotFailure: () => { },
  batchTakeSnapshot: (
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ): Promise<{
    snapshot: SnapshotStore<Snapshot<Data>>;
  }> => {
    try {
      const snapshot = snapshots[0]; // Assuming we only need the first snapshot
      return Promise.resolve({ snapshot: snapshot });
    } catch (error) {
      throw error;
    }
  },
  batchUpdateSnapshots: async (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }[]> => {
    try {
      return [{ snapshot: [] }];
    } catch (error) {
      throw error;
    }
  },
  batchUpdateSnapshotsSuccess: (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ): { snapshots: SnapshotStore<Snapshot<Data>>[] }[] => {
    return [{ snapshots: [] }];
  },

  batchFetchSnapshotsRequest: (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => {
      subscribers: SnapshotStore<Snapshot<Data>>[];
      snapshots: SnapshotStore<Snapshot<Data>>[];
    }
  ): ((
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => {
    subscribers: SnapshotStore<Snapshot<Data>>[];
    snapshots: SnapshotStore<Snapshot<Data>>[];
  }) => {
    return (subscribers, snapshots) => {
      return snapshotData(subscribers, snapshots);
    };
  },

  batchFetchSnapshotsSuccess: (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ): SnapshotStore<Snapshot<Data>>[] => {
    return [...subscribers, ...snapshots];
  },
  batchFetchSnapshotsFailure: () => { },
  batchUpdateSnapshotsFailure: () => { },

  notifySubscribers: (
    subscribers: SnapshotStore<Snapshot<Data>>[]
  ): SnapshotStore<Snapshot<Data>>[] => {
    subscribers.forEach((subscriber) => {
      subscriber.onSnapshot ? subscriber.snapshot : null;
    });

    return subscribers;
  },
  snapshot: function (
    snapshot: SnapshotStore<Snapshot<Data>>[]
  ): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }> {
    return Promise.resolve({ snapshot });
  },
  subscribers: [],
  createSnapshot: function (additionalData: any): void {
    // Create snapshot logic
    const newSnapshot = {
      // Set default snapshot properties
      id: UniqueIDGenerator.generateSnapshotID(),
      data: {},
      timestamp: new Date(),
    };
    // Add additional data
    newSnapshot.data = {
      ...newSnapshot.data,
      ...additionalData,
    };
  },
  snapshotData: function (snapshot: SnapshotStore<Snapshot<Data>>): {
    snapshot: SnapshotStore<Snapshot<Data>>[];
  } {
    return {
      snapshot: [snapshot],
    };
  },
  getSnapshots: function (
  snapshots: SnapshotStore<Snapshot<Data>>[]
  ): Promise<{
    snapshots: SnapshotStore<Snapshot<Data>>[];
  }[]> {
    return Promise.resolve({ snapshots: snapshotConfig.snapshots });
  },

  takeSnapshot: function (
    snapshot: SnapshotStore<Snapshot<Data>>
  ): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }> {
    try {
      if (snapshot) {
        snapshotConfig.snapshots.push({ snapshot: snapshot });
      }
  
      return Promise.resolve({
        snapshot: [snapshot],
      });
    } catch (error) {
      throw error;
    }
  },



  getSnapshot: function (
    snapshot: SnapshotStore<Snapshot<Data>>
  ): Promise<SnapshotStore<Snapshot<Data>>> {
    return Promise.resolve(
      snapshotConfig.snapshots.find(
        snap => snap.id === snapshot.id
      )
    );
    },


  batchUpdateSnapshotsRequest: function (
    snapshotData: (
      subscribers: SnapshotStore<Snapshot<Data>>[],
      snapshots: SnapshotStore<Snapshot<Data>>[]
    ) => {
      subscribers: SnapshotStore<Snapshot<Data>>[];
      snapshots: SnapshotStore<Snapshot<Data>>[];
    }
  ): {
    subscribers: SnapshotStore<Snapshot<Data>>[];
    snapshots: SnapshotStore<Snapshot<Data>>[];
  } {
    throw new Error("Function not implemented.");
  },
  batchFetchSnapshots: function (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ): Promise<{}> {
    throw new Error("Function not implemented.");
  },
  notify: function (
    message: string,
    content: any,
    date: Date,
    type: NotificationType
  ): void {
    throw new Error("Function not implemented.");
  },
  [Symbol.iterator]: function (): IterableIterator<
    Snapshot<SnapshotStore<Snapshot<Data>>[]>
  > {
    throw new Error("Function not implemented.");
  },
};

export { snapshotConfig };
export default SnapshotStoreConfig;
