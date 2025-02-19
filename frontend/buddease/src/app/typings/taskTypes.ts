import { UserRole } from './../components/users/UserRole';
import { BaseData } from "../components/models/data/Data";
import { Task } from "../components/models/tasks/Task";
import { StructuredMetadata } from "../configs/StructuredMetadata";
import { CreationPhase } from "./appTypes";

// Define TaskUnion similar to SnapshotUnion
type TaskUnion<T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>> =
  | Task<T, K, Meta>
  | (TaskWithCriteria<T, K> & T);

// Define TasksArray similar to SnapshotsArray
type TasksArray<T extends BaseData<any>, K extends T = T> = Array<TaskUnion<T, K>>;

// Define TasksObject similar to SnapshotsObject
type TasksObject<T extends BaseData<any>, K extends T = T> = {
  [key: string]: TaskUnion<T, K>;
};

// Define TaskStoreObject similar to SnapshotStoreObject
type TaskStoreObject<T extends BaseData<any>, K extends T = T> = {
  [key: string]: TaskStoreUnion<T, K>;
};

// Define TaskStoreUnion to use K, similar to SnapshotStoreUnion
type TaskStoreUnion<T extends BaseData<any>, K extends T = T> =
  | TaskStoreObject<T, K>
  | Tasks<T, K>;

// Define Tasks to use K, similar to Snapshots
type Tasks<T extends BaseData<any>, K extends T = T> =
  TasksArray<T, K> | TasksObject<T, K>;


  export type {
    Tasks, TasksArray,
    TasksObject,
    TaskStoreObject,
    TaskStoreUnion, TaskUnion
};










// Example Task implementation with metadata
interface ExampleTask extends BaseData {
    title: string;
    description: string;
  }
  
const exampleTask: Task<ExampleTask> = {
  id: "1",
  title: "Task 1",
  description: "This is a task",
  data: {
      title: "Task 1",
      description: "This is a task",
      username: "",
      storeId: 0,
      role: {} as UserRole,
      childIds: [],
      relatedData: []
  },
  metadata: {} // Custom metadata here
};
  
  const creationPhase: CreationPhase<ExampleTask> = {
    id: "phase1",
    phaseName: "Phase 1",
    description: "Initial phase",
    tasks: [exampleTask], // Array of tasks
    startDate: new Date(),
    endDate: new Date(),
    status: "active"
  };
  