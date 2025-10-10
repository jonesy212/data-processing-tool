// Task.ts
import { TaskAttachment, TaskEntity, TaskExcludedFields, TaskIncludedFields, TaskK, TaskMeta } from '@/app/';
import { ScheduledData } from "@/app/components/calendar/ScheduledData";
import { SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { SharedDetails } from '@/app/components/models/data/Details';
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { BaseData } from "@/app/models/data/Data";
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { SharedMetadata } from "@/app/shared/SharedMetadata";
import { TagsRecord } from "@/app/snapshots/SnapshotWithCriteria";
import { AllStatus, DetailsItem } from "@/app/state/stores/DetailsListStore";
import TodoImpl from '@/app/todos/Todo';
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { AllTypes } from "@/app/typings/PropTypes";
import { User } from "@/app/users/User";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { TaskMetadata } from '@/server/database/MetaDataOptions';

export type TaskData = BaseData<any, any, StructuredMetadata<any, any>, Attachment>;
 
interface BaseTaskEntity extends BaseDataEntity {
  id: string;
  title: string;
  description?: string;
  status?: AllStatus;
  priority?: PriorityTypeEnum;
  dueDate?: Date | null;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
  isComplete?: boolean;
  userId?: number;
  projectName?: string;
}


interface Task<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends 
    Omit<TaskMetadata<T, K>, 'tags'>,
    SharedDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SharedTimestamps,
    SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
{
  id: string;
  title: string;
  description: string;
  selectedTask?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  progress: Progress;
  position?: { x: number; y: number };
  property?: string;
  projectName?: string;
  scheduled?: ScheduledData<T>;
  isScheduled?: boolean;
  size?: number;
  assignedTo: User | User[] | null;
  assigneeId: User["id"];
  dueDate: Date | null | undefined;
  payload?: any;
  priority: PriorityTypeEnum | undefined;
  type?: AllTypes | string;
  status?: AllStatus;
  isComplete?: boolean;
  estimatedHours?: number | null;
  actualHours?: number | null;
  completionDate?: Date | null;
  dependencies?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  previouslyAssignedTo: User[];
  done: boolean;
  data: TaskData | undefined;
  [Symbol.iterator]?(): Iterator<any, any, undefined>;
  source: "user" | "system";
  some?: (
    callbackfn: (value: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, index: number, array: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => unknown,
    thisArg?: any
  ) => boolean;
  subtasks?: Array<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | TodoImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined;
  details?: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isActive: boolean;
  tags?: TagsRecord<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | string[] | undefined;
  analysisType?: AnalysisTypeEnum;
  analysisResults?: any[];
  videoThumbnail?: string;
  videoDuration?: number;
  videoUrl?: string;
  userId?: number;
  query?: string;
  getData: () => Promise<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>;
  // New Properties
}

export type { Task };



const createTask = <
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  taskData: Partial<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>
): Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> => {
  const defaultTask: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
    id: "default-id",
    title: "New Task",
    description: "Task Description",
    scheduled: undefined,
    isScheduled: false,
    assignedTo: null,
    version: undefined,
    assigneeId: "",
    dueDate: null,
    payload: undefined,
    priority: undefined,
    type: "general",
    status: undefined,
    isComplete: false,
    estimatedHours: null,
    actualHours: null,
    completionDate: null,
    dependencies: null,
    previouslyAssignedTo: [],
    done: false,
    data: undefined,
    source: "system",
    details: undefined,
    startDate: undefined,
    endDate: undefined,
    isActive: true,
    tags: undefined,
    analysisType: undefined,
    analysisResults: [],
    videoThumbnail: "",
    videoDuration: undefined,
    videoUrl: undefined,
    userId: undefined,
    query: undefined,
    getData: async () => Promise.resolve(defaultTask),
    selectedTask: {} as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    ...taskData, // Merge provided data
  };

  return {
    ...defaultTask,
    metadata: taskMetadata(defaultTask), // Dynamically create metadata
  } as Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
};


  export { createTask, tasksDataSource };

