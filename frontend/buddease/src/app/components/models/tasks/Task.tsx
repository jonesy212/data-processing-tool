// Task.ts
import { ScheduledData } from "@/app/components/calendar/ScheduledData";
import { SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { Attachment } from '@/app/components/documents/Attachment/attachment';
import { SharedDetails } from '@/app/components/models/data/Details';
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { PhaseData, PhaseMeta } from "@/app/components/phases/Phase";
import { Permission } from '@/app/components/users/Permission';
import { User } from "@/app/components/users/User";
import { SharedMetadata } from "@/app/configs/metadata/createMetadataState";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";

import { BaseEntity } from '@/app//components/routing/FuzzyMatch';
import TodoImpl from '@/app/components/todos/Todo';
import { AppMetadata } from '@/app/configs/database/MetaDataOptions';
import { Phase } from "../../phases/Phase";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { EventManager } from "../../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot, TagsRecord } from "../../snapshots";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import { AllTypes } from "../../typings/PropTypes";
import { Idea } from "../../users/Ideas";
import { VideoData } from "../../video/Video";
import CommonDetails, { SupportedData } from "../CommonData";
import { BaseData } from "../data/Data";
import { K, T } from "../data/dataStoreMethods";
import { PriorityTypeEnum, TaskStatus } from "../data/StatusType";
import { TaskMetadata, UnifiedMetaDataOptions } from './../../../configs/database/MetaDataOptions';
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from "@/app/configs/BaseConfig";

export type TaskData = BaseData<any, any, StructuredMetadata<any, any>, Attachment>;
 
// Base flat structure of a Task
interface TaskEntity
  extends BaseEntity<AppMetadata<BaseDataEntity>>, // ✅ Use BaseDataEntity for T
    BaseData<any, any, StructuredMetadata<any, any>, Attachment> {
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
  T extends  BaseDataEntity, 
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends Omit<TaskMetadata<T, K>, 'tags'>,
  SharedDetails<T, K, Meta>,
  SharedTimestamps,
    SharedMetadata<T, K> {
  id: string;
  title: string;
  description: string;
  selectedTask?: Task<T, K, Meta, ExcludedFields>;
  progress: Progress;
  position?: { x: number; y: number }; // Update `position` to be an object
  property?: string;
  projectName?: string;
  scheduled?: ScheduledData<T>;
  isScheduled?: boolean;
  size?: number;
  assignedTo: User | User[] | null;
  assigneeId: User["id"];
  dueDate: Date | null | undefined
  payload?: any;
  priority: PriorityTypeEnum | undefined;
  type?: AllTypes | string;
  status?: AllStatus;
  isComplete?: boolean
  estimatedHours?: number | null;
  actualHours?: number | null;
  completionDate?: Date | null;
  dependencies?: Task<T, K>[] | null;
  previouslyAssignedTo: User[];
  done: boolean;
  data: TaskData | undefined;
  [Symbol.iterator]?(): Iterator<any, any, undefined>;
  source: "user" | "system";
  some?: (
    callbackfn: (value: Task<T, K>, index: number, array: Task<T, K>[]) => unknown,
    thisArg?: any
  ) => boolean;
  subtasks?: Array<Task<T, K, Meta, ExcludedFields> | TodoImpl<T, K, Meta, ExcludedFields>> | undefined;
  details?: DetailsItem<Task<T, K, Meta, ExcludedFields>> | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isActive: boolean;
  tags?: TagsRecord<T, K> | string[] | undefined;
  analysisType?: AnalysisTypeEnum;
  analysisResults?: any[];
  videoThumbnail?: string;
  videoDuration?: number;
  videoUrl?: string;
  userId?: number; 
  query?: string; 
  getData: () => Promise<Task<T, K>>
  // New Properties
}


export interface TaskEntityExtended extends TaskEntity {
  permissions: Permission[];
  ownerId: string;
}

// using commong detais we genrate detais for components by mapping through the objects.
const TaskDetails = <T extends BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>({
  task,
  completed,
}: {
  task: Task<T, K>;
  completed: boolean;
}) => (
  <CommonDetails
    data={{
      id: task.id, 
      completed,
      label: task.label,
      currentMeta: task.currentMeta,
      currentMetadata: task as unknown as SupportedData<T, K, Meta>["data"],
      date: new Date(), 
      createdBy: task.createdBy,
      latestVersion: task.latestVersion
    }}
    details={{
      _id: task.id,
      id: task.id as string,
      title: task.title,
      description: task.description,
      status: task.status,
      participants: task.participants,
      createdBy: task.createdBy,
      updatedAt: task.updatedAt,
      createdAt: task.createdAt,
      startDate: task.startDate,
      uploadedAt: task.uploadedAt,
      type: task.type,
      tags: task.tags,
      isActive: task.isActive,
      phase: task.phase,
      fakeData: task.fakeData,
      comments: task.comments,
      analysisResults: task.analysisResults,
      completed: task.isComplete,
      currentMeta: task.currentMeta,
      currentMetadata: task.currentMetadata,
      latestVersion: task.latestVersion,
      date: task.date
    }}
  />
);

// Define the tasks data source as an object where keys are task IDs and values are task objects
const tasksDataSource: Record<string, Task<T, K>> = {
  "1": {
    taskId: "",
    metadataEntries: {},
    apiEndpoint: "",
    apiKey: "",
    
    timeout: "",
    retryAttempts: 3,
    meta: new Map<string, Snapshot<T, K>>(),
    events: {eventRecords: {}
  },
   
    id: "1",
    _id: "taskData",
    phase: {} as Phase<PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, PhaseData<PhaseData<BaseData<any>>>, PhaseMeta<PhaseData<BaseData<any>>>>,
    videoData: {} as VideoData<T, K>,
    ideas: {} as Idea[],
    timestamp: new Date(),
    category: "default",
    title: "Task 1",
    name: "Unique Task Identifier",
    description: "Description for Task 1",
    assignedTo: [],
    assigneeId: "123",
    dueDate: new Date(),
    payload: {},
    type: "addTask",
    status: "pending",
    priority: PriorityTypeEnum.Low,
    estimatedHours: null,
    actualHours: null,
    completionDate: null,
    dependencies: [],
    previouslyAssignedTo: [],
    done: false,
    data: {} as TaskData,
    source: "user",
    some: (callbackfn: (value: Task<T, K>, index: number, array: Task<T, K>[]) => unknown, thisArg?: any) => false,
    startDate: new Date(),
    endDate: new Date(),
    isActive: true,
    tags: {
      "tag1": {
        id: "tag1",
        name: "Tag 1",
        color: "#000000",
        description: "Tag 1 description",
        enabled: true,
        type: "Category",
        tags: {}, // This should match the type defined in Tag
        relatedTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "creator1",
        timestamp: new Date().getTime(),
        nulltype: ""
      },
      "tag2": {
        id: "tag2",
        name: "Tag 2",
        color: "#000000",
        description: "Tag 2 description",
        enabled: true,
        type: "Category",
        tags: {}, // This should match the type defined in Tag
        relatedTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "creator1",
        timestamp: new Date().getTime(),
        nulltype: ""
      },
      nulltype: ""
    },
    analysisType: {} as AnalysisTypeEnum,
    analysisResults: [],
    videoThumbnail: "thumbnail.jpg",
    videoDuration: 60,
    videoUrl: "https://example.com/video",
    details: {} as DetailsItem<BaseData<any>>,
    [Symbol.iterator]: () => {
      return {
        next: () => {
          return {
            done: true,
            value: {
              _id: "taskData",
              phase: {} as Phase<PhaseData<TaskData<T, K>>>,
              videoData: {} as VideoData<any, any>,
            },
          };
        },
      };
    },
  },
    "2": {
      childIds: [],
      relatedData: [],
      initialState:{},
      createdBy: "",
     
      metadata: {} as UnifiedMetaDataOptions<T, K, StructuredMetadata<T, K>, never>,
      apiKey: "",
      timeout: 300,
      retryAttempts: 3,
     
      mappedMeta: {} as Map<string, Snapshot<T, K, StructuredMetadata<T, K>, never>>,
      meta: {} as StructuredMetadata<T, K>,
      events: {} as EventManager<T, K, StructuredMetadata<T, K>>,
     
    id: "2",
    title: "Task 2",
    name: "Unique Task Identifier",
    description: "Description for Task 2",
    assignedTo: [],
    assigneeId: "456",
    dueDate: new Date(),
    payload: {},
    type: "bug",
    taskId: "",
    taskName: "",
    
    metadataEntries: {
      "file1": {
        originalPath: "/path/to/file1",
        alternatePaths: ["/alt/path1", "/alt/path2"],
        author: "John Doe",
        timestamp: new Date(),
        fileType: "document",
        title: "File 1 Title",
        description: "Description of file 1",
        keywords: ["keyword1", "keyword2"],
        authors: ["Author 1", "Author 2"],
        contributors: [],
        publisher: "Publisher Name",
        copyright: "2024",
        license: "License Info",
        links: ["http://example.com"],
        tags: ["tag1", "tag2"]
      }
      },
      apiEndpoint: "",
    //  apiKey, timeout, retryAttempts, meta, events,
    status: TaskStatus.InProgress,
    priority: PriorityTypeEnum.Medium,
    estimatedHours: 5,
    actualHours: 3,
    completionDate: new Date(),
    dependencies: [],
    previouslyAssignedTo: [],
    done: false,
    data: {} as TaskData,
    source: "system",
    some: (callbackfn: (value: Task<T, K>, index: number, array: Task<T, K>[]) => unknown, thisArg?: any) => false,
    startDate: new Date(),
    endDate: new Date(),
    isActive: true,
    tags: {
      "tag1": {
        id: "tag1",
        name: "Tag 1",
        color: "#000000",
        description: "Tag 1 description",
        enabled: true,
        type: "Category",
        tags: {}, // This should match the type defined in Tag
        relatedTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "creator1",
        timestamp: new Date().getTime(),
        nulltype: {
          relatedTags: [],
          color: "",
          description: "",
          enabled: "",
        }
        
      },
      "tag2": {
        id: "tag2",
        name: "Tag 2",
        color: "#000000",
        description: "Tag 2 description",
        enabled: true,
        type: "Category",
        tags: {}, // This should match the type defined in Tag
        relatedTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "creator1",
        timestamp: new Date().getTime(),
        nulltype: {} as AllTypes
      },
      nulltype: {}
    },
    analysisType: AnalysisTypeEnum.BUG,
    analysisResults: [1, 2, 3],
    videoThumbnail: "thumbnail2.jpg",
    videoDuration: 120,
    videoUrl: "https://example.com/video2",

    [Symbol.iterator]: () => {
      // Add iterator implementation if needed
      return {
        next: () => {
          return {
            done: true,
            value: {
              _id: "taskData2",

              phase: {} as Phase<PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>,
                BaseData<any, any, StructuredMetadata<any, any>, Attachment>>>,
              videoData: {} as VideoData<any, any>,
            },
          };
        },
      };
    },
    _id: "taskData2",
    // videoData: {} as VideoData<any, any>,
   // ideas: {} as Idea[],
    timestamp: new Date(), // Add timestamp property
    category: "default", // Add category property
    // phase: {} as Phase<T, K>,
  },
  // Add more tasks as needed
};

export default TaskDetails;
export type { Task };


// Dynamically create TaskMetadata based on the Task interface
export const taskMetadata = <T extends BaseData<any>, K extends T = T>(
  task: Task<T, K>
): TaskMetadata<T, K> => {
  return {
    subtasks: task.dependencies || [],
    scheduledDate: task.scheduled?.startDate || undefined, // Dynamically assign scheduledDate
    taskId: task.taskId || "",
    taskName: task.taskName || "",
    _id: task._id,
    priority: task.priority,
    assignedTo: task.assignedTo,
    id: task.id,
    timestamp: task.timestamp,
    schema: task.schema,
    latestVersion: task.latestVersion,
    isActive: task.isActive,
    metadataEntries: task.metadataEntries,
    keywords: task.keywords,
    // Add other dynamic properties here as needed
  };
};



const createTask = <T extends BaseData<any>, K extends T = T>(
  taskData: Partial<Task<T, K>>
): Task<T, K> => {
  const defaultTask: Task<T, K> = {
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
    selectedTask: {} as Task<TaskEntity, TaskEntity, StructuredMetadata<TaskEntity, TaskEntity>>,
    ...taskData, // Merge provided data
  };

  return {
    ...defaultTask,
    metadata: taskMetadata(defaultTask), // Dynamically create metadata
  } as Task<T, K>;
};


  export { createTask, tasksDataSource };

