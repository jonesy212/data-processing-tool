// Task.ts
import { PhaseData } from "@/app/components/phases/Phase";
import { ScheduledData } from "@/app/components/calendar/ScheduledData";
import { Label } from "@/app/components/projects/branding/BrandingSettings";
import { User } from "@/app/components/users/User";
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { Phase } from "../../phases/Phase";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { Snapshot, TagsRecord } from "../../snapshots";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import { AllTypes } from "../../typings/PropTypes";
import { Idea } from "../../users/Ideas";
import { VideoData } from "../../video/Video";
import CommonDetails, { SupportedData } from "../CommonData";
import { BaseData, Data } from "../data/Data";
import { K, Meta, T } from "../data/dataStoreMethods";
import { PriorityTypeEnum, TaskStatus } from "../data/StatusType";
import { TaskMetadata, UnifiedMetaDataOptions } from './../../../configs/database/MetaDataOptions';
import { EventManager } from "../../projects/DataAnalysisPhase/DataProcessing/DataStore";
import { FakeDataPartial, FakeData } from "../../intelligence/FakeDataGenerator";
import { Participant } from "@/app/pages/management/ParticipantManagementPage";
import { CustomComment } from "../../state/redux/slices/BlogSlice";
import { Comment } from "../data/Comments";

export type TaskData = SupportedData<T, K<T>, StructuredMetadata<T, any>>;


interface SharedDetails<
  T extends SupportedData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>
> {
  participants: Participant[]
  uploadedAt: Date
  phase: Phase
  phaseName: string
  fakeData?: FakeData
  comments?: number | (Comment<T, K, StructuredMetadata<T, K>> | CustomComment)[] | undefined;
  currentMeta: Meta
  currentMetadata: UnifiedMetaDataOptions<T, K>,
  label: Label
}



// Remove the 'then' method from the Task interface
interface Task<
  T extends BaseData<any> = BaseData<any, any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>,
  > extends Omit<TaskMetadata<T, K>, 'tags'>, SharedDetails<T, K, Meta> {
  id: string;
  title: string;
  description: string;
  projectName?: string;
  scheduled?: ScheduledData<T>;
  isScheduled?: boolean;
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
  details?: DetailsItem<Task<any>> | undefined;
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
  getData: () => Promise<Task<T, K>>,

  // New Properties
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
      // currentMetadata: task.currentMetadata, 
      currentMetadata: task as unknown as SupportedData<T, K, Meta>["data"],
      date: new Date(), 
      createdBy: task.createdBy 
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
      completed: task.isCompleted,
      currentMeta: task.currentMeta,
      currentMetadata: task.currentMetadata,
    }}
  />
);

// Define the tasks data source as an object where keys are task IDs and values are task objects
const tasksDataSource: Record<string, Task<T, K<T>>> = {
  "1": {
    taskId: "",
    metadataEntries: {},
    apiEndpoint: "",
    apiKey: "",
    
    timeout: "",
    retryAttempts: 3,
    meta: new Map<string, Snapshot<T, K<T>>>(),
    events: {eventRecords: {}
  },
   
    id: "1",
    _id: "taskData",
    phase: {} as Phase<Task<T, K<T>>>,
    videoData: {} as VideoData<T, K<T>>,
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
    some: (callbackfn: (value: Task<T, K<T>>, index: number, array: Task<T, K<T>>[]) => unknown, thisArg?: any) => false,
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
              phase: {} as Phase<PhaseData<Task<T, K<T>>>>,
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
     
      metadata: {} as UnifiedMetaDataOptions<T, K<T>, StructuredMetadata<T, K<T>>, never>,
      apiKey: "",
      timeout: 300,
      retryAttempts: 3,
     
      mappedMeta: {} as Map<string, Snapshot<T, K<T>, StructuredMetadata<T, K<T>>, never>>,
      meta: {} as StructuredMetadata<T, K<T>>,
      events: {} as EventManager<T, K<T>, StructuredMetadata<T, K<T>>>,
     
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
        contributors: ["Contributor 1"],
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
    some: (callbackfn: (value: Task<T, K<T>>, index: number, array: Task<T, K<T>>[]) => unknown, thisArg?: any) => false,
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
      },
      nulltype: ""
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
    // phase: {} as Phase<T, K<T>>,
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
    createdBy: task.createdBy,
    timestamp: task.timestamp,
   
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
    version: {},
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
    ...taskData, // Merge provided data
  };

  return {
    ...defaultTask,
    metadata: taskMetadata(defaultTask), // Dynamically create metadata
  } as Task<T, K>;
};


  export { tasksDataSource, createTask };

