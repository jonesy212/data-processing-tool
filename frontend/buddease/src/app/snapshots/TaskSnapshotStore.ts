// TaskSnapshotStore.ts
// // TaskSnapshotStore.ts

// import { Task } from "@/app/models/tasks/Task";
// import { SnapshotStoreConfig } from "@/app/snapshots/SnapshotStoreConfig";
// import SnapshotStore, { Snapshot } from "@/app/snapshots/Snapshot";

// // Define the TaskSnapshotStore interface that extends SnapshotStore
// interface TaskSnapshotStore<Data> extends SnapshotStore<Data> {
//     // Add methods or properties specific to Task snapshots
//     getTasks: () => Task[];
//   }
  
//   // Implement the TaskSnapshotStoreConfig based on SnapshotStoreConfig
//   type TaskSnapshotStoreConfig<Data> = Omit<SnapshotStoreConfig<Data>, 'snapshots'> & {
//     snapshots: Snapshot<Task>[];
//   };
  
//   // Define the initial taskSnapshotConfig based on snapshotConfig
// const taskSnapshotConfig: TaskSnapshotStoreConfig<Snapshot<Task>> = {
//   snapshots: [],
//   category: "tasks",
//   timestamp: new Date(),
//   [Symbol.iterator]: function* () {
//     yield* this.snapshots;
//   },
//   [Symbol.asyncIterator]: async function* () {
//     yield* this.snapshots;
//   },
// };
  
//   // Export the TaskSnapshotStore and taskSnapshotConfig
//   export { TaskSnapshotStore, TaskSnapshotStoreConfig, taskSnapshotConfig };