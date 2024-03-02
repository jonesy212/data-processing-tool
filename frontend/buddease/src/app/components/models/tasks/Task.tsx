// Task.ts
import { User } from "@/app/components/users/User";
import { Phase } from "../../phases/Phase";
import { WritableDraft } from "../../state/redux/ReducerGenerator";
import { VideoData } from "../../video/Video";
import CommonDetails from "../CommonData";
import { Data } from "../data/Data";

export type Idea = {
  id: string; // Unique identifier for the idea
  title: string; // Title or headline of the idea
  description: string; // Detailed description or content of the idea
  author: string; // Author or creator of the idea
  createdAt: Date; // Date and time when the idea was created
  tags: string[]; // Tags or categories associated with the idea
  status: string; // Status of the idea (e.g., "pending", "approved", "rejected")
  // Add more properties as needed to represent an idea
};

interface Task extends Data {
  id: string | number;
  title: string;
  description: string;
  assignedTo: WritableDraft<User> | null; 
  assigneeId: User["id"];
  dueDate: Date;
  payload: any;
  type: "addTask" | "removeTask" | "bug" | "feature";
  status: "pending" | "inProgress" | "completed";
  priority: "low" | "medium" | "high";
  estimatedHours?: number | null;
  actualHours?: number | null;
  completionDate?: Date | null;
  dependencies?: Task[];
  previouslyAssignedTo: User[];
  done: boolean;
  data: Data;
  [Symbol.iterator](): Iterator<any, any, undefined>;
  source: "user" | "system";
  some: (
    callbackfn: (value: Task, index: number, array: Task[]) => unknown,
    thisArg?: any
  ) => boolean;
  then(arg0: (newTask: any) => void): unknown;
  details?: string;

  startDate: Date | undefined;
  endDate: Date;
  isActive: boolean;
  tags: string[];
  analysisType: string;
  analysisResults: any[];
  videoThumbnail: string;
  videoDuration: number;
  videoUrl: string;
}

// using commong detais we genrate detais for components by mapping through the objects.
const TaskDetails: React.FC<{ task: Task }> = ({ task }) => (
  <CommonDetails data={task} />
);

// Define the tasks data source as an object where keys are task IDs and values are task objects
export const tasksDataSource: Record<string, Task> = {
  "1": {
    id: "1",
    title: "Task 1",
    description: "Description for Task 1",
    assignedTo: {} as WritableDraft<User>, // Example value for assignedTo, an array of User objects
    assigneeId: "123", // Example value for assigneeId, assuming it's a string
    dueDate: new Date(), // Example value for dueDate, a Date object
    payload: {}, // Example value for payload, an empty object
    type: "addTask", // Example value for type
    status: "pending", // Example value for status
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
    then: (newTask) => {}, // Example value for then
    startDate: new Date(), // Example value for startDate, a Date object
    endDate: new Date(), // Example value for endDate, a Date object
    isActive: true, // Example value for isActive
    tags: ["tag1", "tag2"], // Example value for tags, an array of strings
    analysisType: "type", // Example value for analysisType
    analysisResults: [], // Example value for analysisResults, an empty array
    videoThumbnail: "thumbnail.jpg", // Example value for videoThumbnail
    videoDuration: 60, // Example value for videoDuration
    videoUrl: "https://example.com/video", // Example value for videoUrl
    details: "Details", // Example value for details
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
    description: "Description for Task 2",
    assignedTo: {} as WritableDraft<User>, // Example value for assignedTo, an array of User objects
    assigneeId: "456", // Example value for assigneeId, assuming it's a string
    dueDate: new Date(), // Example value for dueDate, a Date object
    payload: {}, // Example value for payload, an empty object
    type: "bug", // Example value for type
    status: "inProgress", // Example value for status
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
    then: (newTask) => {}, // Example value for then
    startDate: new Date(), // Example value for startDate, a Date object
    endDate: new Date(), // Example value for endDate, a Date object
    isActive: true, // Example value for isActive
    tags: ["tag3", "tag4"], // Example value for tags, an array of strings
    analysisType: "bug-analysis", // Example value for analysisType
    analysisResults: [1, 2, 3], // Example value for analysisResults, an array of numbers
    videoThumbnail: "thumbnail2.jpg", // Example value for videoThumbnail
    videoDuration: 120, // Example value for videoDuration
    videoUrl: "https://example.com/video2", // Example value for videoUrl
    details: "Details for Task 2", // Example value for details
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
};

export default TaskDetails 
export type { Task };

