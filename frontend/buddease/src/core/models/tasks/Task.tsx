// Task.tsx

import { ScheduledData } from "@/core/calendar/ScheduledData";
import { SharedDetails } from '@/core/components/models/data/Details';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { TaskMetadata } from '@/core/config/MetaDataOptions';
import { Attachment } from '@/core/documents/attachment/Attachment';
import { SharedTimestamps } from '@/core/documents/RelatedProps';
import { Data } from '@/core/models/data/Data';
import { taskMetadata } from '@/core/models/data/TaskMetadata';
import { Progress } from "@/core/models/tracker/ProgressBar";
import { TagsRecord } from '@/core/models/tracker/Tag';
import { PriorityValue } from '@/core/pages/searches/CriteriaType';
import { SharedMetadata } from "@/core/shared/SharedMetadata";
import { AllStatus, DetailsItem } from "@/core/state/stores/DetailsListStore";
import TodoImpl from '@/core/todos/Todo';
import { AnalysisTypeEnum } from "@/core/typings/AnalysisType";
import { TaskEntity } from '@/core/typings/entities/TaskEntity';
import { AllTypes } from "@/core/typings/PropTypes";
import { User } from "@/core/users/User";

interface SubtaskData extends BaseDataEntity {
  parentId: string;
  title: string;
  isCompleted: boolean;
}

export type TaskDataEntity = BaseDataEntity;
 

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
  assignedTo: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  assigneeId: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["id"];
  dueDate: Date | null | undefined;
  done: boolean;
  data: Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
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
  previouslyAssignedTo: User<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];

  dependencies?: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] | null;
  subtasks?: Array<Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | TodoImpl<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> | undefined;
  details?: DetailsItem<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isActive?: boolean;
  tags?: string[] | TagsRecord<T>;
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
// Assuming TaskDetails has a structure similar to Task interface
interface TaskDetails {
  taskId: string;
  details: TaskEntity; // Complete task data structure
}

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
    date: new Date(),
    uploadedAt: new Date(),
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
    schema: {},
    selectedTask: {} as Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    participants: [],
    ...taskData, // Merge provided data
  };

  return {
    ...defaultTask,
    metadata: taskMetadata(defaultTask), // Dynamically create metadata
  } 
  // as Task<TaskEntity, TaskEntityExtended, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>;
};


export { createTask };
export type { Task, TaskDetails };

