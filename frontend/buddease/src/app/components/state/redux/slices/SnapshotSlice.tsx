// snapshots/SnapshotSlice.ts

import { Subscriber } from "@/app/components/users/Subscriber";
import { User, UserData } from "@/app/components/users/User";
import { sendNotification, UserManagerState } from "@/app/components/users/UserSlice";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "../ReducerGenerator";
import { FC } from "react";
import { useSnapshotStore } from "@/app/components/snapshots/useSnapshotStore";
import {useSnapshotManager} from "@/app/components/hooks/useSnapshotManager";
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { BaseData, Data } from "@/app/components/models/data/Data";
import { Snapshot, Snapshots } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { K, SnapshotStoreConfig, T } from "@/app/components/snapshots/SnapshotConfig";
import { findCorrectSnapshotStore, isSnapshot } from "@/app/components/utils/snapshotUtils";


interface SnapshotState {
  snapshotId: string;
  snapshotStores: SnapshotStore<BaseData, BaseData>[];
  snapshots: Snapshot<BaseData, BaseData>[];
  loading: boolean;
  error: string | null;
}

const initialState: SnapshotState = {
  snapshotId: "initial-id",
  snapshots: [],
  loading: false,
  error: null,
  snapshotStores: []
};

export const useSnapshotSlice = createSlice({
  name: "snapshot",
  initialState,
  reducers: {
    addSnapshot: (
      state,
      action: PayloadAction<Snapshot<BaseData, BaseData>>
    ) => {
      if (isSnapshot(action.payload)) {
        const correctStore = findCorrectSnapshotStore(
          action.payload,
          state.snapshotStores as SnapshotStore<BaseData, BaseData>[]        );
        if (correctStore) {
          correctStore.snapshots.push(action.payload);
        } else {
          state.error = 'No matching snapshot store found';
        }
      } else {
        state.error = 'Snapshot data does not match expected type';
      }
    },
    removeSnapshot: (
      state,
      action: PayloadAction<string>
    ) => {
      state.snapshots = state.snapshots.filter(
        (snapshot) => snapshot.id !== action.payload
      );
    },

    clearSnapshots: (state) => {
      state.snapshots = [];
    },

    clearSnapshot: (state, action: PayloadAction<string>) => {
      const snapshotToRemove = state.snapshots.find(
        (snapshot) => snapshot.id === action.payload
      );
      if (snapshotToRemove) {
        snapshotToRemove.data = {} as Map<string, WritableDraft<Snapshot<BaseData, BaseData>>>
      }
    },

    updateSnapshot: (
      state,
      action: PayloadAction<{ id: string; newData: any }>
    ) => {
      const { id, newData } = action.payload;
      const snapshotToUpdate = state.snapshots.find(
        (snapshot) => snapshot.id === id
      );
      if (snapshotToUpdate) {
        snapshotToUpdate.data = newData;
      }
    },

    

    batchRemoveSnapshotsRequest: (
      state,
      action: PayloadAction<{ startDate: Date; endDate: Date }>
    ) => {
      const snapshotManager = useSnapshotManager;
      const subscribers = snapshotManager()

      state.loading = true;
      state.error = null;

      const notifySubscribers = async (
        subscribers: Subscriber<T, K>[]
      ) => {
        const { startDate, endDate } = action.payload;
        const snapshots = state.snapshots.filter(
          (snapshot) =>
            snapshot.date &&
            (snapshot.updateSnapshotFailure.addSnapshotFailure?.date
              ? snapshot.addSnapshotFailure.date >= startDate && snapshot.date <= endDate
              : snapshot.date >= startDate && snapshot.date <= endDate)
        );
        if (snapshots.length > 0) {
          for (const snapshot of snapshots) {
            for (const subscriber of subscribers) {
              if (subscriber.getData() && subscriber.getData().name) {
                sendNotification({
                  message: `Snapshot removed: ${snapshot.id}`,
                  recipient: subscriber.getData().name,
                  snapshot: JSON.parse(JSON.stringify(snapshot.data)),
                });
              }
            }
          }
        }
      };
      notifySubscribers(subscribers)
    },

    batchFetchSnapshotsRequest: (
      state,
      action: PayloadAction<{ startDate: Date; endDate: Date }>
    ) => {
      const snapshotManager = useSnapshotManager;
      const subscribers = snapshotManager()


      state.loading = true;
      state.error = null;

      const notifySubscribers = async (
        subscribers: Subscriber<T, K>[],
        action: PayloadAction<{ snapshot: Snapshot<Data>; subscriber: Subscriber<T, K> }>
      ) => {
        const { snapshot, subscriber } = action.payload;
        if (snapshot.id && subscriber.getData()?.name) {
          const snapshotData = state.snapshots.find(
            (s) => s.id === snapshot.id
          )?.data;
          if (snapshotData) {
            sendNotification({
              message: `New snapshot received: ${snapshot.id}`,
              recipient: subscriber.getData()?.name,
              snapshot: JSON.parse(JSON.stringify(snapshotData)),
            });
          }
        }
      }
  
      // Fetch snapshots from database or API
      const { notify } = action.meta;
      type WritableDraft<T> = {
        -readonly [P in keyof T]: WritableDraft<T[P]>;
      };
      // For demonstration purposes, we're just going to return the same snapshots
      state.snapshots = [
        {
          id: "1",
          key: "value",
          topic: "topic",
          configOption: {} as WritableDraft<SnapshotStoreConfig<BaseData, BaseData>>,
          config: {} as WritableDraft<SnapshotStoreConfig<T, K>>[],
          subscription: {} as WritableDraft<SnapshotStoreConfig<T, K>>,
          initialState: {} as WritableDraft<SnapshotStoreConfig<T, K>>,
          category: "category",
          store,
          timestamp: new Date(),
        },
        {
          id: "2",
          data: {
            assignee: {
              name: "user_2",
              email: "<EMAIL>",
            },
            startDate: new Date(),
            endDate: new Date(),
            component: {} as FC<any>,
          },
        },
      ];
      // Notify subscribers
      notifySubscribers(
        snapshot,
        subscribers,
        // notify,
        // id,
        // notification,
        // date,
        // content,
        // type
      );
    },

    batchFetchSnapshotsSuccess: (
      state,
      action: PayloadAction<{
        snapshots: WritableDraft<Snapshot<BaseData, any>>[];
      }>
    ) => {
      state.loading = false;
      state.snapshots = action.payload.snapshots;
    },

    batchFetchSnapshotsFailure: (
      state,
      action: PayloadAction<{ error: string }>
    ) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    batchUpdateSnapshotsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },

    batchUpdateSnapshotsSuccess: (
      state,
      action: PayloadAction<{
        snapshots: WritableDraft<Snapshot<Data>>[];
      }>
    ) => {
      state.loading = false;
      state.snapshots = action.payload.snapshots;
    
      // Additional logic
      // Log success message
      console.log('Snapshots updated successfully');
    
      // Optionally, you might want to update other parts of the state
      // Example: Resetting error message
      state.error = null;
    
      // Example: Handling specific snapshot updates if necessary
      state.snapshots.forEach(snapshot => {
        if (snapshot.id === "specific-id") {
          snapshot.status = "updated";
          console.log("Specific snapshot updated", snapshot);
        }
      });
    },
    

    batchUpdateSnapshotsFailure: (
      state,
      action: PayloadAction<{ error: { code: string, message: string } }>
    ) => {
      state.loading = false;
      state.error = action.payload.error.message;
      
      // Handle specific error codes
      switch (action.payload.error.code) {
        case "not-found":
          // Handle not found error
          console.error("Error: Snapshot not found");
          // You can set a specific error message or perform other state updates
          state.error = "Snapshot not found. Please check the ID and try again.";
          break;
        case "permission-denied":
          // Handle permission denied error
          console.error("Error: Permission denied");
          state.error = "You do not have permission to perform this action.";
          break;
        case "network-error":
          // Handle network error
          console.error("Error: Network error");
          state.error = "Network error. Please check your connection and try again.";
          break;
        default:
          // Handle other errors
          console.error("Error: " + action.payload.error.message);
          state.error = "An unexpected error occurred. Please try again.";
          break;
      }
    },
    

    batchRemoveSnapshotsSuccess: (state, action: PayloadAction<string[]>) => {
      state.loading = false;
      state.snapshots = state.snapshots.filter(
        (snapshot) => !action.payload.includes(snapshot.id as string)      );
    },
    batchRemoveSnapshotsFailure: (
      state,
      action: PayloadAction<{ error: string }>
    ) => {
      state.loading = false;
      state.error = action.payload.error;
    },

    //  
  },

});

export const {
  addSnapshot,
  removeSnapshot,
  updateSnapshot,
  clearSnapshot,
  clearSnapshots,
  batchFetchSnapshotsRequest,
  batchFetchSnapshotsSuccess,
  batchFetchSnapshotsFailure,
  batchUpdateSnapshotsRequest,
  batchUpdateSnapshotsSuccess,
  batchUpdateSnapshotsFailure,
  batchRemoveSnapshotsRequest,
  batchRemoveSnapshotsSuccess,
  batchRemoveSnapshotsFailure,
} = useSnapshotSlice.actions;

export default useSnapshotSlice.reducer;
export type { SnapshotState };
