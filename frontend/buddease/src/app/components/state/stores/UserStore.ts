// user/UserStore.ts
import { makeAutoObservable } from "mobx";
import { useState } from "react";
import { User } from "../../users/User";
import { AssignTaskStore, useAssignTaskStore } from "./AssignTaskStore";
import SnapshotStore, { SnapshotStoreConfig } from "./SnapshotStore";

export interface UserStore {
  users: Record<string, User[]>;
  assignedTaskStore: AssignTaskStore;
  snapshotStore: SnapshotStore<Record<string, User[]>>;
  updateUserState: (newUsers: Record<string, User[]>) => void;

  batchFetchSnapshotsRequest: (snapshots: Record<string, Record<string, User[]>>) => void;
    batchFetchSnapshotsSuccess: (snapshots: Record<string, Record<string, User[]>>) => void;
    batchFetchSnapshotsFailure: (error: string) => void;
  // Add other user-related properties as needed
}

const userManagerStore = (): UserStore => {
  const [users, setUsers] = useState<Record<string, User[]>>({
    // Initialize with the required structure
  });

  // Include the AssignTaskStore
  const assignedTaskStore = useAssignTaskStore();
  // Initialize SnapshotStore
  const initialSnapshot = {};
  const snapshotStore = new SnapshotStore(
    {} as SnapshotStoreConfig<typeof initialSnapshot>
  );

  // Add other user-related methods and properties as needed

  const updateUserState = (newUsers: Record<string, User[]>) => {
    setUsers(newUsers);
  };

  
  const batchFetchSnapshotsRequest = (snapshots: Record<string, Record<string, User[]>>) => void {
    //make api call to fetch snapshots
    
  };

  const batchFetchSnapshotsSuccess = (
    snapshots: Record<string, Record<string, User[]>>
  ) => {
    snapshotStore.state = snapshots;
  };

  const batchFetchSnapshotsFailure = (error: string) => {
    console.error("Error fetching snapshots: ", error);
  };



  const userStore = makeAutoObservable({
  users,
  assignedTaskStore,
  snapshotStore,
  updateUserState,
  batchFetchSnapshotsRequest,
  batchFetchSnapshotsSuccess,
  batchFetchSnapshotsFailure,
  // Add other user-related properties as needed
});


return userStore;

};

export { userManagerStore };
