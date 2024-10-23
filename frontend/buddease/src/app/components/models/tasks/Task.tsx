// Task.ts
import { User } from "@/app/components/users/User";
import { FC } from "react";
import { Phase } from "../../phases/Phase";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import { AllTypes } from "../../typings/PropTypes";
import { Idea } from "../../users/Ideas";
import CommonDetails, { SupportedData } from "../CommonData";
import { Data } from "../data/Data";
import { PriorityTypeEnum, TaskStatus } from "../data/StatusType";
import { Team, TeamDetails } from "../teams/Team";
import { TaskMetadata } from './../../../configs/database/MetaDataOptions'
import React from "react";
import { TagsRecord } from "../../snapshots";

export type TaskData = SupportedData<Task, Task>;

// Remove the 'then' method from the Task interface
interface Task extends Data, TaskMetadata<Task, UnifiedMetaDataOptions> {
  id: string;
  title: string;
  description: string;
  name?: string | null;
  projectName?: string;
  assignedTo: User | User[] | null;
  assigneeId: User["id"];
  dueDate: Date | null | undefined
  payload?: any;
  priority: PriorityTypeEnum | undefined;
  type?: AllTypes | string;
  status?: AllStatus;
  estimatedHours?: number | null;
  actualHours?: number | null;
  completionDate?: Date | null;
  dependencies?: Task[] | null;
  previouslyAssignedTo: User[];
  done: boolean;
  // data: TaskData | undefined;
  [Symbol.iterator]?(): Iterator<any, any, undefined>;
  source: "user" | "system";
  some?: (
    callbackfn: (value: Task, index: number, array: Task[]) => unknown,
    thisArg?: any
  ) => boolean;
  details?: DetailsItem<Task> | undefined;
  startDate: Date | undefined;
  endDate: Date | undefined;
  isActive: boolean;
  tags?: TagsRecord
  analysisType?: AnalysisTypeEnum;
  analysisResults?: any[];
  videoThumbnail?: string;
  videoDuration?: number;
  videoUrl?: string;
  userId?: number; 
  query?: string; 
}

// using commong detais we genrate detais for components by mapping through the objects.
const TaskDetails: React.FC<{ task: Task; completed: boolean }> = ({
  task,
  completed,
}) => (
  <CommonDetails
    data={{ id: task.id, completed }}
    details={{
      _id: task.id,
      id: task.id as string,
      title: task.title,
      description: task.description,
      status: task.status,
      participants: task.participants,
      updatedAt: task.updatedAt,
      createdAt: task.createdAt,
      startDate: task.createdAt,
      uploadedAt: task.uploadedAt,
      type: task.type,
      tags: task.tags,
      isActive: task.isActive,
      phase: task.phase,
      fakeData: task.fakeData,
      comments: task.comments,
      analysisResults: task.analysisResults,
      completed: task.isCompleted,
    }}
  />
);

// Define the tasks data source as an object where keys are task IDs and values are task objects
const tasksDataSource: Record<string, Task> = {
  "1": {
    id: "1",
    _id: "taskData",
    phase: {} as Phase<Task>,
    videoData: {} as VideoData<any, any>,
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
    some: (callbackfn) => false,
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
    },
    analysisType: {} as AnalysisTypeEnum,
    analysisResults: [],
    videoThumbnail: "thumbnail.jpg",
    videoDuration: 60,
    videoUrl: "https://example.com/video",
    details: {} as DetailsItem<Task>,
    [Symbol.iterator]: () => {
      return {
        next: () => {
          return {
            done: true,
            value: {
              _id: "taskData",
              phase: {} as Phase<Task>,
              videoData: {} as VideoData<any, any>,
            },
          };
        },
      };
    },
  },
  "2": {
    id: "2",
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
    data: {} as TaskData,
    source: "system",
    some: (callbackfn) => false,
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

              phase: {} as Phase<Task>,
              videoData: {} as VideoData<any, any>,
            },
          };
        },
      };
    },
    _id: "taskData2",
    phase: {} as Phase<Task>,
    videoData: {} as VideoData<any, any>,
    ideas: {} as Idea[],
    timestamp: new Date(), // Add timestamp property
    category: "default", // Add category property
  },
  // Add more tasks as needed
};

export default TaskDetails;
export type { Task };

  export { tasksDataSource };

