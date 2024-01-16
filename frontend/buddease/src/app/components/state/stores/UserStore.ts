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
  // Add other user-related properties as needed
}

const useUserStore = (): UserStore => {
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

  makeAutoObservable({
    users,
    assignedTaskStore,
    snapshotStore,
    updateUserState,
    // Add other user-related properties as needed
  });

  return {
    users,
    assignedTaskStore,
    snapshotStore,
    updateUserState,
    // Add other user-related properties as needed
  };
};

export { useUserStore };
