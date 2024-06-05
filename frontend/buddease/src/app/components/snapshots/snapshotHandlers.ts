import  snapshot, { Snapshots } from './SnapshotStore';
// snapshotHandlers.ts
import defineConfig from '../../components/snapshots/SnapshotConfig';
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
// import SnapshotStoreConfig, { snapshotConfig } from "./SnapshotConfig";
import SnapshotStore, { Snapshot } from "./SnapshotStore";
import { retrieveSnapshotData } from './RetrieveSnapshotData';
import { sendNotification } from '../users/UserSlice';
import updateUI from '../documents/editing/updateUI';
import { useDispatch } from 'react-redux';
import { useSnapshotSlice } from '../state/redux/slices/SnapshotSlice';
import { WritableDraft } from '../state/redux/ReducerGenerator';
import SnapshotStoreConfig from './SnapshotConfig';

const { notify } = useNotification();
const dispatch = useDispatch()
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

export const initSnapshot: T = {
  length: 0,
  id: "initial-id",
  category: "initial-category",
  subscriberId: 'initial-subscriber',
  timestamp: new Date(),
  content: undefined,
};
type T = any;


const snapshotStore = new SnapshotStore<Snapshot<Data>>(
  notify,
  initSnapshot,
  snapshotConfig,
  {} as Data
);


// Handler for updating a snapshot
export const updateSnapshot = async <T>(
  snapshot: SnapshotStore<Snapshot<T>, any> // Use generic type T for Snapshot and any for data
): Promise<{ snapshot: SnapshotStore<Snapshot<T>, any>[] }> => {
  try {
    const updatedSnapshotData = {
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
    };

    snapshot.update(updatedSnapshotData);

    return {
      snapshot: [snapshot],
    };
  } catch (error) {
    throw error;
  }
};




export const getAllSnapshots = async <T, DataT>(
  snapshotConfig: typeof SnapshotStoreConfig<SnapshotStore<Snapshot<T>>>
): Promise<SnapshotStore<Snapshot<T>, DataT>[]> => {
  try {
    return Promise.resolve(
      snapshotConfig.snapshots.map(
        (snapshotData: SnapshotStore<Snapshot<T>, DataT>) => {
          const snapshotStore = new SnapshotStore<Snapshot<T>, DataT>(
            notify,
            initSnapshot,
            snapshotConfig,
            snapshotData.data
          );
          return snapshotStore;
        }
      )
    );
  } catch (error) {
    throw error;
  }
};

// Handler for batch taking snapshots
export const batchTakeSnapshot = async <T>(
  snapshot: SnapshotStore<Snapshot<T>, any>, // Use generic type T for Snapshot and any for data
  snapshots: SnapshotStore<Snapshot<T>, any>[] // Use generic type T for Snapshot and any for data
): Promise<{ snapshots: SnapshotStore<Snapshot<T>, any>[] }> => {
  try {
    const result: SnapshotStore<Snapshot<T>, any>[] = [...snapshots];
    return { snapshots: result };
  } catch (error) {
    throw error;
  }
};


// Handler for batch updating snapshots
export const batchUpdateSnapshots = async <T>(
  subscribers: Subscriber<Snapshot<T>>[],
  snapshots: SnapshotStore<Snapshot<T>, any>[] // Use generic type T for Snapshot and any for data
): Promise<{ snapshot: SnapshotStore<Snapshot<T>, any>[] }[]> => {
  try {
    return [{ snapshot: [] }];
  } catch (error) {
    throw error;
  }
};



export const batchUpdateSnapshotsSuccess = <T>(
  subscribers: Subscriber<Snapshot<T>>[],
  snapshots: SnapshotStore<Snapshot<T>, any>[]
): { snapshots: SnapshotStore<Snapshot<T>, any>[] }[] => {
  return [{ snapshots }];
};


// Handler for batch taking snapshots request

export const batchTakeSnapshotsRequest = async <T>(
  snapshotData: (
    subscribers: Subscriber<Snapshot<T>>[],
    snapshots: SnapshotStore<Snapshot<T>, any>[]
  ) => Promise<SnapshotStore<Snapshot<T>, any>[]>
): Promise<{ snapshots: SnapshotStore<Snapshot<T>, any>[] }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};



export const batchUpdateSnapshotsRequest = async <T>(
  snapshotData: (
    subscribers: Subscriber<Snapshot<T>>[],
    snapshots: SnapshotStore<Snapshot<T>, any>[]
  ) => Promise<SnapshotStore<Snapshot<T>, any>[]>
): Promise<{ snapshots: SnapshotStore<Snapshot<T>, any>[] }> => {
  const snapshots = await snapshotData([], []);
  return { snapshots };
};



// Define batchFetchSnapshotsRequest function
export async function batchFetchSnapshotsRequest(
  subscribers: Subscriber<Snapshot<Data>>[],
  snapshots: Snapshots<Data>
): Promise<{
  subscribers: Subscriber<Snapshot<Data>>[];
  snapshots: Snapshots<Data>;
}> {
  console.log("Batch snapshot fetching requested.");

  try {
    const target = {
      endpoint: "https://example.com/api/snapshots/batch",
      params: {
        limit: 100,
        sortBy: "createdAt",
      },
    };

    const response = await fetch(target.endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(target.params),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch snapshots. Status: ${response.status}`);
    }

    const fetchedSnapshots: Snapshot<Data>[] = await response.json();

    console.log("Fetched snapshots:", fetchedSnapshots);
    return {
      subscribers,
      snapshots: fetchedSnapshots,
    };
  } catch (error) {
    console.error("Error fetching snapshots in batch:", error);
    throw error;
  }
}



// Handler for batch fetching snapshots success
export const batchFetchSnapshotsSuccess = <T>(
  subscribers: Subscriber<Snapshot<T>>[],
  snapshots: SnapshotStore<Snapshot<T>, any>[]
): SnapshotStore<Snapshot<T>, any>[] => {
  return [...snapshots];
}



// Handler for batch fetching snapshots failure
export const batchFetchSnapshotsFailure = (payload: { error: Error }) => {
  // handle failure
};

// Handler for batch updating snapshots failure
export const batchUpdateSnapshotsFailure = (payload: { error: Error }) => {
  // handle failure
};

function adaptSnapshot<T extends Data>(snapshot: Snapshot<Data>): Snapshot<T> {
  const adaptedSnapshot: Snapshot<T> = {
    id: snapshot.id,
    timestamp: snapshot.timestamp,
    category: snapshot.category,
    data: snapshot.data as T,
  };

  return adaptedSnapshot;
}

export const notifySubscribers = async <T extends Data>(
  snapshotId: string,
  subscribers: Subscriber<T>[],
  callback: (data: any) => void
): Promise<Subscriber<T>[]> => {
  const snapshotManager = useSnapshotManager<T>();

  await Promise.all(
    subscribers.map(async (subscriber) => {
      snapshotManager.onSnapshot(
          snapshotId,
          callback,
        async (snapshot: Snapshot<Todo>) => {
          const adaptedSnapshot: Snapshot<Todo> = adaptSnapshot<Todo>(snapshot);

          // 1. Send Notifications
          await dispatch(
            useSnapshotSlice.actions.sendNotification({
              snapshot: adaptedSnapshot as WritableDraft<Snapshot<Todo>>,
              subscriber,
            })
          );

          // 2. Update UI
          await updateUI(adaptedSnapshot, subscriber); // Implement updateUI function

          // 3. Execute Subscribers' Callbacks
          await executeCallback(adaptedSnapshot, subscriber); // Implement executeCallback function

          // 4. Broadcast Changes
          await broadcastChanges(adaptedSnapshot, subscriber); // Implement broadcastChanges function

          // 5. Update Database
          await updateDatabase(adaptedSnapshot); // Implement updateDatabase function

          // 6. Trigger Actions
          await triggerActions(adaptedSnapshot); // Implement triggerActions function

          // 7. Log Changes
          logChanges(adaptedSnapshot); // Implement logChanges function

          // 8. Handle Errors
          try {
            await handleErrors(adaptedSnapshot); // Implement handleErrors function
          } catch (error) {
            console.error("Error occurred while handling errors:", error);
          }
        }
      );
    })
  );

  return subscribers;
};
