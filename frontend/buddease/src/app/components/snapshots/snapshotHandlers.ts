// snapshotHandlers.ts

import { Data } from "../models/data/Data";
import { NotificationTypeEnum, useNotification } from "../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import { generateSnapshotId } from "../utils/snapshotUtils";
import SnapshotStoreConfig from "./SnapshotConfig";
import SnapshotStore, { Snapshot } from "./SnapshotStore";

const {notify} = useNotification();

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
    });

    return {
      snapshot: [snapshot],
    };
  } catch (error) {
    throw error;
  }
};


// Handler for fetching all snapshots
export const getAllSnapshots = async (
  snapshotConfig: SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>[]>
): Promise<SnapshotStore<Snapshot<Data>>[]> => {
  try {
    return Promise.resolve(
      snapshotConfig.snapshots.map((snapshotData) => {
        // Ensure snapshotData is of type SnapshotStoreConfig<Snapshot<Data>>
        const snapshotStore = new SnapshotStore<Snapshot<Data>>(
          snapshotData as SnapshotStore<Snapshot<Data>>[] & SnapshotStoreConfig<SnapshotStore<Snapshot<Data>>>,         
          (message, content, date, type) => {
            notify(
              "getAllSnapshotsSuccss",
              NOTIFICATION_MESSAGES.Snapshot.FETCHING_SNAPSHOT_SUCCESS,
              "Getting snapshots",
              new Date(),
              NotificationTypeEnum.OperationSuccess
            );
            }
        )
            ;
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
  subscribers: SnapshotStore<Snapshot<Data>>[],
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
  subscribers: SnapshotStore<Snapshot<Data>>[],
  snapshots: SnapshotStore<Snapshot<Data>>[]
): { snapshots: SnapshotStore<Snapshot<Data>>[] }[] => {
  return [{ snapshots: [] }];
};

// Handler for batch taking snapshots request
export const batchTakeSnapshotsRequest = async (
  snapshotData: (
    subscribers: SnapshotStore<Snapshot<Data>>[],
    snapshots: SnapshotStore<Snapshot<Data>>[]
  ) => Promise<SnapshotStore<Snapshot<Data>>[]>
): Promise<{ snapshots: SnapshotStore<Snapshot<Data>>[] }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};

// Handler for batch fetching snapshots request
export const batchFetchSnapshotsRequest = (
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
};

// Handler for batch fetching snapshots success
export const batchFetchSnapshotsSuccess = (
  subscribers: SnapshotStore<Snapshot<Data>>[],
  snapshots: SnapshotStore<Snapshot<Data>>[]
): SnapshotStore<Snapshot<Data>>[] => {
  return [...subscribers, ...snapshots];
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
export const notifySubscribers = (
  subscribers: SnapshotStore<Snapshot<Data>>[]
): SnapshotStore<Snapshot<Data>>[] => {
  subscribers.forEach((subscriber) => {
    subscriber.onSnapshot ? subscriber.snapshot : null;
  });

  return subscribers;
};
