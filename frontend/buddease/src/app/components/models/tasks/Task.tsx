// Task.ts
import { User } from "@/app/components/users/User";
import { FC } from "react";
import { Phase } from "../../phases/Phase";
import { AnalysisTypeEnum } from "../../projects/DataAnalysisPhase/AnalysisType";
import { DataAnalysisResult } from '../../projects/DataAnalysisPhase/DataAnalysisResult';
import { WritableDraft } from "../../state/redux/ReducerGenerator";
import { AllStatus, DetailsItem } from "../../state/stores/DetailsListStore";
import { AllTypes } from "../../typings/PropTypes";
import { Idea } from "../../users/Ideas";
import { VideoData } from "../../video/Video";
import CommonDetails, { CommonData } from "../CommonData";
import { Data } from "../data/Data";
import { TaskStatus } from "../data/StatusType";
import { Team, TeamDetails } from "../teams/Team";




interface Task extends Data {
  id: string
  title: string;
  description: string;
  
  name?: string | null;
  projectName?: string;

  assignedTo: WritableDraft<User> [] | null; 
  assigneeId: User["id"];
  dueDate: Date;
  payload: any;
  priority: "low" | "medium" | "high" | "normal" | "pending";
  type?: AllTypes
  status?: AllStatus
  estimatedHours?: number | null;
  actualHours?: number | null;
  completionDate?: Date | null;
  dependencies?: Task[];
  previouslyAssignedTo: User[];
  done: boolean;
  data: Data ;
  [Symbol.iterator](): Iterator<any, any, undefined>;
  source: "user" | "system";
  some?: (
    callbackfn: (value: Task, index: number, array: Task[]) => unknown,
    thisArg?: any
  ) => boolean;
  then?(arg0: (newTask: any) => void): unknown;
  details?: DetailsItem<typeof TeamDetails> | undefined;

  startDate: Date | undefined;
  endDate: Date | undefined;
  isActive: boolean;
  tags: string[];
  analysisType?: AnalysisTypeEnum;
  analysisResults?: any[];
  videoThumbnail?: string;
  videoDuration?: number;
  videoUrl?: string;

}

// using commong detais we genrate detais for components by mapping through the objects.
const TaskDetails: React.FC<{ task: Task }> = ({ task }) => (
  <CommonDetails
    data={{ task: task } as CommonData<never>}
  details={
    {
      _id: task.id,
      id: task.id as string,
      title: task.title,
      description: task.description,
      status: task.status,
      participants: task.participants,

      createdAt: task.createdAt,
      // author: task.assignedTo?.name || "",
      startDate: task.createdAt,
      uploadedAt: task.uploadedAt,
      type: task.type,
      tags: task.tags,
      isActive: task.isActive,
      phase: task.phase,
      fakeData: task.fakeData,
      comments: task.comments,
      analysisResults: task.analysisResults,
      // Add more properties as needed
    }

} 
  />
);

// Define the tasks data source as an object where keys are task IDs and values are task objects
const tasksDataSource: Record<string, Task> = {
  "1": {
    id: "1",
    title: "Task 1",
    name: "Unique Task Identifier",
    description: "Description for Task 1",
    assignedTo: {} as WritableDraft<User>[], // Example value for assignedTo, an array of User objects
    assigneeId: "123", // Example value for assigneeId, assuming it's a string
    dueDate: new Date(), // Example value for dueDate, a Date object
    payload: {}, // Example value for payload, an empty object
    type: "addTask", // Example value for type
    status: TaskStatus.Pending, // Example value for status
    priority: "low", // Example value for priority
    estimatedHours: null, // Example value for estimatedHours
    actualHours: null, // Example value for actualHours
    completionDate: null, // Example value for completionDate
    dependencies: [], // Example value for dependencies, an array of Task objects
    previouslyAssignedTo: [], // Example value for previouslyAssignedTo, an array of User objects
    done: false, // Example value for done
    data: {} as Data, // Example value for data, an empty object
    source: "user", // Example value for source
    some: (callbackfn) => false, // Example value for some
    then: (newTask) => { }, // Example value for then
    startDate: new Date(), // Example value for startDate, a Date object
    endDate: new Date(), // Example value for endDate, a Date object
    isActive: true, // Example value for isActive
    tags: ["tag1", "tag2"], // Example value for tags, an array of strings
    analysisType: {} as AnalysisTypeEnum, // Example value for analysisType
    analysisResults: {} as DataAnalysisResult[], // Example value for analysisResults, an empty array
    videoThumbnail: "thumbnail.jpg", // Example value for videoThumbnail
    videoDuration: 60, // Example value for videoDuration
    videoUrl: "https://example.com/video", // Example value for videoUrl
    details: {} as DetailsItem<FC<{ team: Team }>>, // Example value for details
    [Symbol.iterator]: () => {
      // Add more tasks as needed
      return {
        next: () => {
          return {
            done: true,
            value: {
              _id: "taskData", // Example value
              phase: {} as Phase,
              videoData: {} as VideoData,
            },
          };
        },
      };
    },
    _id: "taskData", // Example value
    phase: {} as Phase,
    videoData: {} as VideoData,
    ideas: {} as Idea[],
  },
  "2": {
    id: "2",
    title: "Task 2",
    name: "Unique Task Identifier",
    description: "Description for Task 2",
    assignedTo: {} as WritableDraft<User>[], // Example value for assignedTo, an array of User objects
    assigneeId: "456", // Example value for assigneeId, assuming it's a string
    dueDate: new Date(), // Example value for dueDate, a Date object
    payload: {}, // Example value for payload, an empty object
    type: "bug", // Example value for type
    status: TaskStatus.InProgress, // Example value for status
    priority: "medium", // Example value for priority
    estimatedHours: 5, // Example value for estimatedHours
    actualHours: 3, // Example value for actualHours
    completionDate: new Date(), // Example value for completionDate
    dependencies: [], // Example value for dependencies, an array of Task objects
    previouslyAssignedTo: [], // Example value for previouslyAssignedTo, an array of User objects
    done: false, // Example value for done
    data: {} as Data, // Example value for data, an empty object
    source: "system", // Example value for source
    some: (callbackfn) => false, // Example value for some
    then: (newTask) => { }, // Example value for then
    startDate: new Date(), // Example value for startDate, a Date object
    endDate: new Date(), // Example value for endDate, a Date object
    isActive: true, // Example value for isActive
    tags: ["tag3", "tag4"], // Example value for tags, an array of strings
    analysisType: AnalysisTypeEnum.BUG, // Example value for analysisType
    analysisResults: [1, 2, 3], // Example value for analysisResults, an array of numbers
    videoThumbnail: "thumbnail2.jpg", // Example value for videoThumbnail
    videoDuration: 120, // Example value for videoDuration
    videoUrl: "https://example.com/video2", // Example value for videoUrl
    
       // Example value for details
      [Symbol.iterator]: () => {
        // Add iterator implementation if needed
        return {
          next: () => {
            return {
              done: true,
              value: {
                _id: "taskData2", // Example value
                phase: {} as Phase,
                videoData: {} as VideoData,
              },
            };
          },
        };
      },
      _id: "taskData2", // Example value
      phase: {} as Phase,
      videoData: {} as VideoData,
      ideas: {} as Idea[],
    },
    // Add more tasks as needed
  }

  
  
export default TaskDetails 
export type { Task };

  export { tasksDataSource };
