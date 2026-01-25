// TaskDataSource.ts
import { PriorityTypeEnum, TaskStatus } from "@/core/models/data/StatusType";
import type { Phase, PhaseData } from "@/core/models/phases/Phase";
import type { Task } from '@/core/models/tasks/Task';
import type { DetailsItem } from '@/core/state/stores/DetailsListStore';
import { AnalysisTypeEnum } from "@/core/typings/AnalysisType";
import type { TaskAttachment, TaskEntity, TaskMeta } from '@/core/typings/entities/TaskEntity';
import type { TaskExcludedFields, TaskIncludedFields, TaskK } from '@/core/typings/entities/TaskEntity';
import type { VideoData } from "@/core/typings/videoTypes/Video";
import type { Idea } from "@/core/users/Ideas";
import type { Data } from '@/core/models/data/Data';

// Define the tasks data source with proper generic parameters
const tasksDataSource: Record<string, Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>> = {
  "1": {
    id: "1",
    _id: "taskData",
    taskId: "1",
    taskName: "Task 1",
    
    // Core task properties
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
    data: {} as Data<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    source: "user",
    
    // Timeline properties
    startDate: new Date(),
    endDate: new Date(),
    isActive: true,
    timestamp: new Date(),
    
    // Metadata properties
    category: "default",
    metadataEntries: {},
    
    // API properties
    apiEndpoint: "",
    apiKey: "",
    timeout: "30000",
    retryAttempts: 3,
    
    // Media properties  
    videoThumbnail: "thumbnail.jpg",
    videoDuration: 60,
    videoUrl: "https://example.com/video",
    
    // Analysis properties
    analysisType: AnalysisTypeEnum.DEFAULT,
    analysisResults: [],
    
    // Complex type properties (properly typed)
    phase: {} as Phase<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    videoData: {} as VideoData<TaskEntity, TaskK>,
    ideas: [] as Idea[],
    details: {} as DetailsItem<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    
    // Meta property (correct type)
    meta: {} as TaskMeta,
    
    // Events property (correct type)
    events: { eventRecords: {} },
    
    // Tags property (simplified and consistent)
    tags: {
      "tag1": {
        id: "tag1",
        name: "Tag 1",
        color: "#000000",
        description: "Tag 1 description",
        enabled: true,
        type: "Category",
        tags: {},
        relatedTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "creator1",
        timestamp: new Date().getTime(),
        nulltype: ""
      }
    },
    
    // Iterator implementation
    [Symbol.iterator]: function* () {
      yield this;
    },
    
    // Array method implementation
    some: function(callbackfn: (
      value: Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>, 
      index: number, 
      array: Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]) => boolean, 
      thisArg?: any) {
      return callbackfn(this, 0, [this]);
    }
  },
  
  "2": {
    id: "2",
    _id: "taskData2",
    taskId: "2", 
    taskName: "Task 2",
    
    // Core task properties
    title: "Task 2",
    name: "Unique Task Identifier", 
    description: "Description for Task 2",
    assignedTo: [],
    assigneeId: "456",
    dueDate: new Date(),
    payload: {},
    type: "bug",
    status: TaskStatus.InProgress,
    priority: PriorityTypeEnum.Medium,
    estimatedHours: 5,
    actualHours: 3,
    completionDate: new Date(),
    dependencies: [],
    previouslyAssignedTo: [],
    done: false,
    data: {} as Data<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    source: "system",
    
    // Timeline properties
    startDate: new Date(),
    endDate: new Date(), 
    isActive: true,
    timestamp: new Date(),
    
    // Metadata properties
    category: "default",
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
    
    // API properties
    apiEndpoint: "",
    apiKey: "",
    timeout: 300,
    retryAttempts: 3,
    
    // Media properties
    videoThumbnail: "thumbnail2.jpg",
    videoDuration: 120,
    videoUrl: "https://example.com/video2",
    
    // Analysis properties
    analysisType: AnalysisTypeEnum.BUG,
    analysisResults: [1, 2, 3],
    
    // Complex type properties
    phase: {} as Phase<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    videoData: {} as VideoData<TaskEntity, TaskK>,
    ideas: [] as Idea[],
    details: {} as DetailsItem<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>,
    
    // Meta property (correct type)
    meta: {} as TaskMeta,
    
    // Events property (correct type)  
    events: { eventRecords: {} },
    
    // Additional properties from second task
    childIds: [],
    relatedData: [],
    initialState: {},
    createdBy: "",
    
    // Tags property (consistent with first task)
    tags: {
      "tag1": {
        id: "tag1",
        name: "Tag 1", 
        color: "#000000",
        description: "Tag 1 description",
        enabled: true,
        type: "Category",
        tags: {},
        relatedTags: [],
        createdAt: new Date(),
        updatedAt: new Date(), 
        createdBy: "creator1",
        timestamp: new Date().getTime(),
        nulltype: 'none'
      }
    },
    
    // Iterator implementation
    [Symbol.iterator]: function* () {
      yield this;
    },
    
    // Array method implementation
    some: function(callbackfn: (
      value: Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>, 
      index: number, 
      array: Task<TaskEntity, TaskK, TaskMeta, TaskAttachment, TaskExcludedFields, TaskIncludedFields>[]) => boolean, 
      thisArg?: any) {
      return callbackfn(this, 0, [this]);
    }
  }
};

export { tasksDataSource };
