
// Task.ts
import { ScheduledData } from "@/app/calendar/ScheduledData";
import { SharedDetails } from '@/app/components/models/data/Details';
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { Attachment } from '@/app/documents/attachment/Attachment';
import { SharedTimestamps } from '@/app/documents/RelatedProps';
import { PriorityTypeEnum } from "@/app/models/data/StatusType";
import { taskMetadata } from '@/app/models/data/TaskMetadata';
import { PriorityValue } from '@/app/pages/searches/CriteriaType';
import { SharedMetadata } from "@/app/shared/SharedMetadata";
import { TagsRecord } from "@/app/snapshots/SnapshotWithCriteria";
import { AllStatus, DetailsItem } from "@/app/state/stores/DetailsListStore";
import TodoImpl from '@/app/todos/Todo';
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { TaskAttachment, TaskEntity, TaskExcludedFields, TaskIncludedFields, TaskK, TaskMeta, TaskStructuredMetadata } from '@/app/typings/entities/TaskEntity';
import { AllTypes } from "@/app/typings/PropTypes";
import { User } from "@/app/users/User";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { TaskMetadata } from '@/app/config/MetaDataOptions';

export type  TaskData = BaseDataEntity<
  TaskEntity,             // T
  TaskK,             // K
  TaskStructuredMetadata,   // Meta
  TaskAttachment,           // AttachmentType
  TaskExcludedFields,       // ExcludedFields
  TaskIncludedFields        // IncludedFields
>;
 
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
    SharedTimestamps,
    Omit<TaskMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 'tags' | 'permissions'>,
    SharedDetails<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    SharedMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> 
{
  id: string;
  title: string;
  description: string;
  assignedTo: User | User[] | null;
  assigneeId: User["id"];
  dueDate: Date | null | undefined;
  done: boolean;
  data: TaskData | undefined;
  progress: Progress | undefined;
  selectedTask?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  position?: { x: number; y: number };
  property?: string;
  projectName?: string;
  scheduled?: ScheduledData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> ;
  isScheduled?: boolean;
  size?: number;
  payload?: any;
  priority: PriorityValue | undefined;
  type?: AllTypes | string;
  status?: AllStatus;
  isComplete?: boolean;
  estimatedHours?: number | null;
  actualHours?: number | null;
  completionDate?: Date | null;
  previouslyAssignedTo: User[];

  dependencies?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
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
    source: "user" | "system";
  [Symbol.iterator]?(): Iterator<any, any, undefined>;
  some?: (
    callbackfn: (value: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, index: number, array: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => unknown,
    thisArg?: any
  ) => boolean;
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
    metadataEntries: {},
    scheduled: undefined,
    isScheduled: false,
    assignedTo: null,
    version: undefined,
    progress: undefined,
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


  export { createTask };

  export type { BaseTaskEntity };
