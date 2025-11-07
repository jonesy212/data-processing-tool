import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';

import { Attachment } from '@/app/documents/attachment/Attachment';


const snapshotSuccessMethods: SnapshotSuccessMethods<
  BaseDataEntity
> = {
    addDataSuccess: ({ data }) => {
    console.log("addDataSuccess called", data);
  },

  batchFetchSnapshotsSuccess: (subscribers, snapshots) => {
    console.log("batchFetchSnapshotsSuccess called", subscribers, snapshots);
  },

  batchUpdateSnapshotsSuccess: (subscribers, snapshots) => {
    console.log("batchUpdateSnapshotsSuccess called", subscribers, snapshots);
  },

  updateSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {
    console.log("updateSnapshotSuccess called", snapshotId, snapshot, payload);
  },

  createSnapshotSuccess: (snapshotId, snapshotManager, snapshot, payload) => {
    console.log("createSnapshotSuccess called", snapshotId, snapshot, payload);
  },

  addSnapshotSuccess: (snapshot, subscribers) => {
    console.log("addSnapshotSuccess called", snapshot, subscribers);
  },

  takeSnapshotSuccess: (snapshot) => {
    console.log("takeSnapshotSuccess called", snapshot);
  },

  takeSnapshotsSuccess: (snapshots) => {
    console.log("takeSnapshotsSuccess called", snapshots);
  },

  handleSnapshotSuccess: (message, snapshot, snapshotId) => {
    console.log("handleSnapshotSuccess called", message, snapshotId, snapshot);
  },

  configureSnapshotStore: (payload) => {
    console.log("configureSnapshotStore called", payload);
    // Example: could initialize store and apply payload
    // payload.snapshotStore.configure(payload.snapshotStoreConfig);
  },

  fetchSnapshotSuccess: (
    id,
    snapshotId,
    snapshotStore,
    payload,
    snapshot,
    data,
    delegate,
    snapshotData
  ) => {
    console.log("fetchSnapshotSuccess called", snapshotId, snapshot, data);
    // Example: call delegate for each snapshot
    snapshotData(snapshotStore.manager, [], snapshot);
    return []; // Return an array of SnapshotWithCriteria as required
  }
  // ... rest of your SnapshotSuccessMethods implementations
};