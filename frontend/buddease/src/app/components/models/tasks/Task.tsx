// Task.ts
import { ScheduledData } from "@/app/components/calendar/ScheduledData";
import { SharedTimestamps } from '@/app/components/documents/RelatedProps';
import { SharedDetails } from '@/app/components/models/data/Details';
import { Progress } from "@/app/components/models/tracker/ProgressBar";
import { PhaseData, PhaseMeta } from "@/app/components/phases/Phase";
import { Permission } from '@/app/components/users/Permission';
import { Attachment } from '@/app/documents/Attachment/attachment';
import { User } from "@/app/users/User";
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { SharedMetadata } from "@/config/metadata/MetadataHooks";

import { BaseEntity } from '@/app//components/routing/FuzzyMatch';
import { EventManager } from "@/app/@/projects/DataAnalysisPhase/DataProcessing/DataStore";
import TodoImpl from '@/app/components/todos/Todo';
import { BaseData } from "@/app/data/Data";
import { K, T } from "@/app/data/dataStoreMethods";
import CommonDetails, { SupportedData } from "@/app/models/CommonData";
import { PriorityTypeEnum, TaskStatus } from "@/app/models/data/StatusType";
import { Phase } from "@/app/phases/Phase";
import { Snapshot, TagsRecord } from "@/app/snapshots";
import { AllStatus, DetailsItem } from "@/app/state/stores/DetailsListStore";
import { AnalysisTypeEnum } from "@/app/typings/AnalysisType";
import { AllTypes } from "@/app/typings/PropTypes";
import { Idea } from "@/app/users/Ideas";
import { VideoData } from "@/app/video/Video";
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/config/BaseConfig";
import { TaskMetadata, UnifiedMetaDataOptions } from '@/configs/database/MetaDataOptions';
import { AppMetadata } from "@/server/database/MetaDataOptions";

export type TaskData = BaseData<any, any, StructuredMetadata<any, any>, Attachment>;
 

export interface TaskEntityExtended extends TaskEntity {
  permissions: Permission[];
  ownerId: string;
}

// using commong detais we genrate detais for components by mapping through the objects.
const TaskDetails = Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>({
  task,
  completed,
}: {
  task: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  completed: boolean;
}) => (
  <CommonDetails
    data={{
      id: task.id, 
      completed,
      label: task.label,
      currentMeta: task.currentMeta,
      currentMetadata: task as unknown as SupportedData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>["data"],
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
const tasksDataSource: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {
  "1": {
    taskId: "",
    metadataEntries: {},
    apiEndpoint: "",
    apiKey: "",
    
    timeout: "",
    retryAttempts: 3,
    meta: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(),
    events: {eventRecords: {}
  },
   
    id: "1",
    _id: "taskData",
    phase: {} as Phase<PhaseData<BaseData<any, any, StructuredMetadata<any, any>, Attachment>, BaseData<any, any, StructuredMetadata<any, any>, Attachment>>, PhaseData<PhaseData<BaseData<any>>>, PhaseMeta<PhaseData<BaseData<any>>>>,
    videoData: {} as VideoData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
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
    some: (callbackfn: (value: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, index: number, array: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => unknown, thisArg?: any) => false,
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
              phase: {} as Phase<PhaseData<TaskData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>>,
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
     
      metadata: {} as UnifiedMetaDataOptions<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, never>,
      apiKey: "",
      timeout: 300,
      retryAttempts: 3,
     
      mappedMeta: {} as Map<string, Snapshot<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, never>>,
      meta: {} as StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
      events: {} as EventManager<T, K, StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>,
     
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
    some: (callbackfn: (value: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, index: number, array: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[]) => unknown, thisArg?: any) => false,
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
    // phase: {} as Phase<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  },
  // Add more tasks as needed
};

export default TaskDetails;
export type { Task };



  export { tasksDataSource };

