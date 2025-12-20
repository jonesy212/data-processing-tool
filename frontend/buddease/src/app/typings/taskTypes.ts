// taskTypes.ts
import { Task } from "@/app/components/models/tasks/Task";
import { AppStructurePermissions } from '@/app/config/appStructure/AppStructure';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseData } from '@/app/models/data/Data';
import { UserRole } from "@/app/models/UserRole";
import { TaskEntity } from '@/app/typings/entities/TaskEntity';
import { CreationPhase } from "@/app/typings/appTypes";

// Define TaskUnion similar to SnapshotUnion
type TaskUnion<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T , 
> =
  | Task<T, K, Meta>
  | (TaskWithCriteria<T, K> & T);

// Define TasksArray similar to SnapshotsArray
type TasksArray<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T > = Array<TaskUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;

// Define TasksObject similar to SnapshotsObject
type TasksObject<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T > = {
  [key: string]: TaskUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

// Define TaskStoreObject similar to SnapshotStoreObject
type TaskStoreObject<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T > = {
  [key: string]: TaskStoreUnion<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
};

// Define TaskStoreUnion to use K, similar to SnapshotStoreUnion
type TaskStoreUnion<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T > =
  | TaskStoreObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
  | Tasks<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;

// Define Tasks to use K, similar to Snapshots
type Tasks<  
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T 
  > =
  TasksArray<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
  | TasksObject<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;



interface TaskEntityExtended extends TaskEntity {
  appPermissions?: AppStructurePermissions[];
  permissions: Permission[];
  ownerId: string;
}

  export type {
  TaskEntityExtended, Tasks, TasksArray,
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
  