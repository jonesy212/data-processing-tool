// TaskDataSource.ts

// Define the tasks data source as an object where keys are task IDs and values are task objects
const tasksDataSource: Record<string, Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> = {
  "1": {

    progress, getData, participants, uploadedAt,
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