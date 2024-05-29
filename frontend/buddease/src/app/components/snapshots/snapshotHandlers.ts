import  snapshot from './SnapshotStore';
// snapshotHandlers.ts

import useSnapshotManager from "../hooks/useSnapshotManager";
import { Data } from "../models/data/Data";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { Subscriber } from "../users/Subscriber";
import { generateSnapshotId } from "../utils/snapshotUtils";
import SnapshotStoreConfig, { snapshotConfig } from "./SnapshotConfig";
import SnapshotStore, { Snapshot } from "./SnapshotStore";

const { notify } = useNotification();

// Handler for creating a snapshot
export const createSnapshot = (additionalData: any): void => {
  const newSnapshot = {
    id: generateSnapshotId,
    data: {},
    timestamp: new Date(),
  };

  newSnapshot.data = {
    ...newSnapshot.data,
    ...additionalData,
  };
};

export const initSnapshot: Snapshot<Data> = {
  length: 0,
  id: "initial-id",
  category: "initial-category",
  timestamp: new Date(),
  content: undefined,
  data: {},
};

// Handler for updating a snapshot
export const updateSnapshot = async (
  snapshot: SnapshotStore<Snapshot<Data>>
): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }> => {
  try {
    snapshot.update({
      id: generateSnapshotId,
      data: {
        ...snapshot.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      timestamp: new Date(),
      category: "update",
      length: 0,
      content: undefined,
    });

    return {
      snapshot: [snapshot],
    };
  } catch (error) {
    throw error;
  }
};
export const getAllSnapshots = async (
  snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>
): Promise<SnapshotStore<Snapshot<Data>>[]> => {
  try {
    return Promise.resolve(
      snapshotConfig.snapshots.map((snapshotData: SnapshotStore<Snapshot<Data>>) => {
        const snapshotStore = new SnapshotStore<Snapshot<Data>>(
          notify,
          initSnapshot, // Pass your initial snapshot object here
          snapshotConfig
        );
        return snapshotStore;
      })
    );
  } catch (error) {
    throw error;
  }
};

// Handler for batch taking snapshots
export const batchTakeSnapshot = async (
  snapshot: SnapshotStore<Snapshot<Data>>,
  snapshots: SnapshotStore<Snapshot<Data>>[]
): Promise<{ snapshots: SnapshotStore<Snapshot<Data>>[] }> => {
  try {
    const result: SnapshotStore<Snapshot<Data>>[] = [...snapshots];
    return { snapshots: result };
  } catch (error) {
    throw error;
  }
};

// Handler for batch updating snapshots
export const batchUpdateSnapshots = async (
  subscribers: Subscriber<Snapshot<Data>>[],
  snapshots: SnapshotStore<Snapshot<Data>>[]
): Promise<{ snapshot: SnapshotStore<Snapshot<Data>>[] }[]> => {
  try {
    return [{ snapshot: [] }];
  } catch (error) {
    throw error;
  }
};

// Handler for batch updating snapshots success
export const batchUpdateSnapshotsSuccess = (
  subscribers: Subscriber<Snapshot<Data>>[],
  snapshots: SnapshotStore<Snapshot<Data>>[]
): { snapshots: SnapshotStore<Snapshot<Data>>[] }[] => {
  return [{ snapshots: [] }];
};

// Handler for batch taking snapshots request
export const batchTakeSnapshotsRequest = async (
  snapshotData: (
    subscribers: Subscriber<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => Promise<SnapshotStore<Snapshot<Data>>[]>
): Promise<{ snapshots: SnapshotStore<Snapshot<Data>>[] }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};

// Handler for batch fetching snapshots request
export const batchFetchSnapshotsRequest = (
  snapshotData: (
    subscribers: Subscriber<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => {
    subscribers: Subscriber<Snapshot<Data>>[];
    snapshots: SnapshotStore<Snapshot<Data>>[];
  }
): ((
  subscribers: Subscriber<Snapshot<Data>>[],
  snapshots: SnapshotStore<Snapshot<Data>>[]
) => {
  subscribers: Subscriber<Snapshot<Data>>[];
  snapshots: SnapshotStore<Snapshot<Data>>[];
}) => {
  return (subscribers, snapshots) => {
    return snapshotData(subscribers, snapshots);
  };
};

// Handler for batch fetching snapshots success
export const batchFetchSnapshotsSuccess = (
  subscribers: Subscriber<Snapshot<Data>>[],
  snapshots: SnapshotStore<Snapshot<Data>>[]
): SnapshotStore<Snapshot<Data>>[] => {
  // Transform each Subscriber into a SnapshotStore
  const subscriberSnapshots = subscribers.map(subscriber => {
    // Assuming there's a method to convert Subscriber to SnapshotStore
    return subscriber.toSnapshotStore(initSnapshot,snapshotConfig); // Modify this according to your implementation
  });

  // Concatenate the transformed arrays with the original snapshots
  return [...subscriberSnapshots, ...snapshots];
};

// Handler for batch fetching snapshots failure
export const batchFetchSnapshotsFailure = (payload: { error: Error }) => {
  // handle failure
};

// Handler for batch updating snapshots failure
export const batchUpdateSnapshotsFailure = (payload: { error: Error }) => {
  // handle failure
};

// Handler for notifying subscribers


export const notifySubscribers = async <T extends Data>(
  snapshotId: string,
  subscribers: Subscriber<Snapshot<T>>[],
  T: Data
): Promise<Subscriber<Snapshot<T>>[]> => {
  const snapshotManager = useSnapshotManager<T>();

  await Promise.all(
    subscribers.map(async (subscriber) => {
      const shouldSubscribe = true; // Adjust this condition as needed
      if (shouldSubscribe) {
        snapshotManager.onSnapshot(snapshotId, async (snapshot: Snapshot<T>) => {
          console.log("Received snapshot:", snapshot);
          await subscriber.onSnapshot(snapshot);
        });
      }
    })
  );

  return subscribers;
};
