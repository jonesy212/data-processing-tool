import { WritableDraft } from '@/app/components/state/redux/ReducerGenerator';
import { userId } from '@/app/components/users/ApiUser';
// ContentSlice.ts
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import FileSaver from "file-saver";
import * as Papa from "papaparse";
import { NamingConventionsError } from "shared_error_handling";
import * as XLSX from "xlsx";
import useWebNotifications from "../../../hooks/commHooks/useWebNotifications";
import { TaskFilter } from '@/app/pages/searchs/TaskFilter';
import { ContentLogger } from "../../../logging/Logger";
import { ContentItem } from "../../../models/content/ContentItem";
import { Data } from "../../../models/data/Data";
import { Progress } from "../../../models/tracker/ProgressBar";
import { Project } from "../../../projects/Project";
import { sanitizeInput } from "../../../security/SanitizationFunctions";
import {
  NotificationType,
  NotificationTypeEnum,
  useNotification,
} from "../../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../../support/NotificationMessages";
import { Idea } from "../../../users/Ideas";
import { User } from "../../../users/User";
import { VideoData } from "../../../video/Video";
import { implementThen } from "../../stores/CommonEvent";
import { ProjectManagerStore } from "../../stores/ProjectStore";
import { CustomComment } from "./BlogSlice";
import ContentDetails from "@/app/components/models/content/ContentDetails";
import { PriorityTypeEnum, StatusType, TaskStatus } from "@/app/components/models/data/StatusType";
import { AnalysisTypeEnum } from "@/app/components/projects/DataAnalysisPhase/AnalysisType";
import { Task } from "@/app/components/models/tasks/Task";
import { useSecureUserId } from "@/app/components/utils/useSecureUserId";
import { setAssignedUserFilter } from './FilterSlice';
import { FileType } from '@/app/components/documents/Attachment/attachment';
import { TaskSort } from '@/app/components/sort/TaskSort';

const { showNotification } = useWebNotifications();
const { notify } = useNotification();
interface ContentManagerState {
    name: string;
    contentItems: ContentItem[];
    actionStack: ContentItem[];
    redoStack: ContentItem[];
  contentTitle: string;
  userId: string;
    contentDescription: string;
    contentType: string;
    priority: PriorityTypeEnum;
    projectManager: ProjectManagerStore | null;
    pendingContent: ContentItem[]; // Initialize pendingContent array
    inProgressContent: ContentItem[]; // Initialize inProgressContent array
    completedContent: ContentItem[]; // Initialize completedContent array
    author: User;
    assignedTo: Task['assignedTo']
    assigneeId: string;
    assigneeIds: string[];
    dueDate: Date | undefined;
    payload: any;
    type: string;
    status: string;
    previouslyAssignedTo: any[];
    done: boolean;
    data: Data;
    source: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    isActive: boolean;
    tags: string[];
    analysisType: AnalysisTypeEnum;
    analysisResults: any[];
    videoThumbnail: string;
    videoDuration: number;
    videoUrl: string;
    [Symbol.iterator]: () => Iterator<any, any, undefined>;
    _id: string;
    phase: any | null;
    videoData: VideoData | undefined;
  ideas: any[];
  tasks: Task[];
  taskFilter: string;
  setAssignedUserFilter?: (userId: string) => void;
  asignedTo: Task['assignedTo'] | null;
  completedTasks: Task[]
  }
  
  
  const contentItems: Record<string, ContentItem> = {};
  const initialState: ContentManagerState = {
    contentItems: [],
    contentTitle: "",
    name: "contentManager",
    contentDescription: "",
    contentType: "",
    actionStack: [],
    redoStack: [],
    priority: PriorityTypeEnum.Low,
    pendingContent: [],
    inProgressContent: [],
    completedContent: [],
    ...contentItems,
    projectManager: null,
    assignedTo: {} as WritableDraft<User>,
    assigneeId: "",
    assigneeIds: [],
    dueDate: undefined,
    payload: undefined,
    type: "",
    status: "",
    previouslyAssignedTo: [],
    done: false,
    data: {} as Data,
    source: "",
    startDate: undefined,
    endDate: undefined,
    isActive: false,
    tags: [],
    analysisType: AnalysisTypeEnum.DESCRIPTIVE,
    analysisResults: [],
    videoThumbnail: "",
    videoDuration: 0,
    videoUrl: "",
    _id: "",
    phase: undefined,
    videoData: undefined,
    ideas: [],
    tasks: [],
    asignedTo: {} as Task['assignedTo'],
    [Symbol.iterator]: function (): Iterator<any, any, undefined> {
      throw new Error("Method not implemented.");
    },
    author: {
      id: "",
      username: "",
    } as User,
    taskFilter: '',
    userId: '',
    completedTasks: []
  };
  



const generateNewContent = (
  state: { contentItems: ContentItem[] },
  action: PayloadAction<Partial<ContentItem>>
) => {
  const contentId = UniqueIDGenerator.generateContentID(
    action.payload.id ?? "",
    action.payload.title ?? ""
  );
  const newContent: ContentItem = {
    id: action.payload.id ?? "",
    title: action.payload.title ?? "",
    body: action.payload.body,
    heading: action.payload.heading,
    subheading: action.payload.subheading,
    description: action.payload.description ?? null,
    footer: action.payload.footer,
    status: action.payload.status,
    _id: contentId,
    type: 'text',
    userId: undefined
  };
  state.contentItems.push(newContent);
  ContentLogger.logEventToFile("Content", "New content item generated with id: " + contentId, "content.log");
  return newContent;
};

export const contentSlice = createSlice({
  name: "contentManager",
  initialState,
  reducers: {
    updateContentTitle: (state, action: PayloadAction<string>) => {
      state.contentTitle = action.payload;
    },

    updateContentDescription: (state, action: PayloadAction<string>) => {
      state.contentDescription = action.payload;
    },

    updateContentType: (
      state,
      action: PayloadAction<string>
    ) => {
      state.contentType = action.payload;
    },

    updateContentDetails: (
      state,
      action: PayloadAction<{ contentId: string; updatedDetails: Partial<ContentItem> }>
    ) => {
      const { contentId, updatedDetails } = action.payload;
      const contentToUpdate = state.contentItems.find((content) => content.id === contentId);

      if (contentToUpdate) {
        // Update the content details
        Object.assign(contentToUpdate, updatedDetails);
      }
    },

    dueDate: (
      state,
      action: PayloadAction<{
        id: string | number;
        updatedDetails: typeof ContentDetails;
        dueDate: Date;
      }>
    ) => {
      const { id, dueDate, updatedDetails } = action.payload; // Include id in the destructuring
      const contentToUpdateIndex = state.contentItems.findIndex((content) => content.id === id);

      if (contentToUpdateIndex !== -1) {
        const contentToUpdate = state.contentItems[contentToUpdateIndex];
        const updatedContent = {
          ...contentToUpdate,
          dueDate,
          ...updatedDetails, // Assuming updatedDetails contains other properties to update
        };

        state.contentItems[contentToUpdateIndex] = updatedContent;
      }
    },


    generateNewContent: (
      state,
      action: PayloadAction<{ id: string; title: string }>
    ) => {
      const { id, title } = action.payload;

      const newContent: {
        id: string;
        heading: string;
        title: string;
        description: string;
        type: FileType;
        body: string;
        assignedTo: Task["assignedTo"];
        userId: string;
        setAssignedUserFilter: boolean;
        priority: string;
        status: StatusType;
      } = {
        id: UniqueIDGenerator.generateContentID(id, title),
        heading: "",
        userId: state.userId,
        title: state.contentTitle,
        description: state.contentDescription,
        type: state.contentType as FileType,
        body: "",
        assignedTo: state.assignedTo,
        setAssignedUserFilter: state.data.setAssignedUserFilter,
        priority: state.priority,
        status: StatusType.Pending,
      };

      state.pendingContent.push(newContent);
      state.contentTitle = "";
      state.contentDescription = "";

      state.pendingContent.push({
        ...newContent,
        status: StatusType.Pending,
        userId: undefined,
      });
    },
    
    addContent: (
      state,
      action: PayloadAction<{ id: string; title: string; isComplete: boolean }>
    ) => {
      const { id, title } = action.payload;

      const generatedContentID = UniqueIDGenerator.generateContentID(id, title);

      if (sanitizeInput(state.contentTitle.trim()) === "") {
        console.error("Content title cannot be empty.");
        return;
      }

      const newContent: WritableDraft<ContentItem> = {
        id: generatedContentID,
        userId: state.assignedTo ? state.assignedTo._id : "",
        title,
        description: state.contentDescription,
        type: state.contentType as FileType,
        body: "",
        heading: "",
        status: StatusType.Pending,
      };

      state.contentItems.push(newContent);
      const userId = state.assignedTo?._id ?? "";
      ContentLogger.logContentCreation("New Content", id, userId);

      if (generateNewContent) {
        const newContent = generateNewContent(state, action);
        state.contentItems.push(newContent);
      }

      state.contentTitle = "";
      state.contentDescription = "";
      state.contentType = "";
    },
    


    removeContent: (state, action: PayloadAction<string>) => {
      state.contentItems = state.contentItems.filter((content) => content.id !== action.payload);
    },

    completeTask: (
      state,
      action: PayloadAction<string>
    ) => {
      const taskId = action.payload;

      // Find the task to complete
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);

      if (taskIndex === -1) {
        return;
      }

      // Mark task as completed
      state.contentItems[taskIndex].status = "completed";
      // Log task completion
      ContentLogger.logTaskCompletion(taskId);
      // Move completed task to completedTasks array
      state.completedTasks.push(state.tasks[taskIndex]);
      // Remove task from tasks array
      state.tasks.splice(taskIndex, 1);
      // Push completed task to completedTasks array  
    },


    updateTaskTitle: (state, action: PayloadAction<{taskId: string, title: string}>) => {
      const {taskId, title} = action.payload;

      const taskIndex = state.tasks.findIndex(task => task.id === taskId);

      if(taskIndex !== -1) {
        state.tasks[taskIndex].title = title;
      }
    },

    updateTaskDescription: (state, action: PayloadAction<{ taskId: string, description: string }>) => { 
      const { taskId, description } = action.payload;

      const taskIndex = state.tasks.findIndex(task => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].description = description;
      }
    },

    updateTaskStatus: (
      state,
      action: PayloadAction<{ taskId: string, status: TaskStatus }>
    ) => {
      const {taskId, status} = action.payload;

      const taskIndex = state.tasks.findIndex(task => task.id === taskId);

      if(taskIndex !== -1) {
        state.tasks[taskIndex].status = status;
      }
    },

    addTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        title: string;
        description: string;
        dueDate: Date;
        status: TaskStatus;
      }>
    ) => {
      const { taskId, title, description, dueDate, status } = action.payload;
      // Generate a unique ID for the new task
      const generatedTaskID = UniqueIDGenerator.generateTaskID(taskId, title);
      // Add the new task
      state.tasks.push({
        id: generatedTaskID,
        title,
        description,
        dueDate,
        status,
        assignedTo: null,
        assigneeId: undefined,
        payload: undefined,
        priority: "low",
        previouslyAssignedTo: [],
        done: false,
        data: {} as WritableDraft<Data>,
        source: "user",
        some: function (
          callbackfn: (value: Task, index: number, array: Task[]) => unknown,
          thisArg?: any
        ): boolean {
          throw new Error("Function not implemented.");
        },
        then: function (arg0: (newTask: any) => void): unknown {
          throw new Error("Function not implemented.");
        },
        startDate: undefined,
        endDate: undefined,
        isActive: false,
        tags: [],
        analysisType: AnalysisTypeEnum.DESCRIPTIVE,
        analysisResults: [],
        videoThumbnail: "",
        videoDuration: 0,
        videoUrl: "",
        [Symbol.iterator]: function (): Iterator<any, any, undefined> {
          throw new Error("Function not implemented.");
        },
      });
      const userId = state.assignedTo?._id;
      // Log task creation
      if (userId) {
        ContentLogger.logTaskCreation(
          generatedTaskID,
          title,
          description,
          userId
        );
      }
    },


    removeTask: (
      state,
      action: PayloadAction<string>
    ) => { 
      const taskId = action.payload;

      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      const {title} = state.tasks[taskIndex];
      if (taskIndex !== -1) {
        state.tasks.splice(taskIndex, 1);

        const userId = state.assignedTo?._id;
        if (userId) {
          ContentLogger.logTaskDeletion(taskId,title, userId);
        }
      }
    },

    filterTasks: (state, action: PayloadAction<TaskFilter>) => {
      state.taskFilter = action.payload;

      switch(action.payload) {
        case "active":
          state.tasks = state.tasks.filter(task => task.status !== "completed");
          break;
        case "completed":
          state.tasks = state.tasks.filter(task => task.status === "completed");
          break;
        default:
          break;
      }
    },


    sortTasks: (state, action: PayloadAction<TaskSort>) => {
      state.tasks.sort((a, b) => {
        if (action.payload === "title") {
          return a.title.localeCompare(b.title);
        } else if (action.payload === "dueDate") {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (typeof action.payload === "string") {
          return 0;
        } else {
          throw new Error("Invalid sort payload");
        }
      });
    },


    editTask: (
      state,
      action: PayloadAction<{
        completedContentId: string,
        changes: Partial<Task>,
        taskId: string
      }>
    ) => {
      const { completedContentId, taskId, changes } = action.payload;

      const taskIndex = state.tasks.findIndex(task => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...changes
        };
      }
      // Log content completion
      const userId = state.asignedTo?._id;
      if (userId) {
        ContentLogger.logContentCompletion(completedContentId, taskId, userId);
      }
       
    },
    
    completeContent: (state, action: PayloadAction<string>) => {
      const completedContentId = action.payload;
      // Find the completed content in the state
      const completedContent = state.contentItems.find(
        (content) => content.id === completedContentId
      );

      if (!completedContent) {
        // If the content does not exist, display an error notification
        notify(
          "completedContent",
          "Could not find content to complete.",
          NOTIFICATION_MESSAGES.Notifications.DEFAULT,
          new Date(),
          "Error" as NotificationType
        );
        return;
      }

      // Check if notification permission is granted before displaying notification
      if (Notification.permission === "granted") {
        showNotification("Content Completed", {
          body: "Congratulations! You have completed a content.",
        });
      } else {
        notify(
          "completedContent",
          "Notification permission not granted.",
          NOTIFICATION_MESSAGES.Notifications.NOTIFICATION_SEND_FAILED,
          new Date(),
          NotificationTypeEnum.OperationError
        );
      }
    },

    // More reducers...

  },
});



export const {
    // Content management actions
    completeContent,
    updateContentTitle,
    updateContentDescription,
    updateContentType,
    addContent,
    removeContent,
    // Task interaction actions
    completeTask,
    updateTaskTitle,
    updateTaskDescription,
    updateTaskStatus,
    addTask,
    removeTask,
    // Task filtering and sorting actions
    filterTasks,
    sortTasks,
    // Task history and state manipulation actions
    editTask,
    searchTasks,
    assignTask,
    archiveTask,
    undoAction,
    redoAction,
    // Task import and export actions
    exportTasks,
    importTasks,
// Additional task actions
    updateTaskDetails,
    updateTaskTags,
    updateTaskDueDate,
    updateTaskPriority,
    addTaskDependency,
    removeTaskDependency,
    addTaskComment,
    removeTaskComment,
    getTaskHistory,
    revertToPreviousState,
    markTaskAsInProgress,
    updateTaskAssignee,
    batchFetchTaskSnapshots,
    updateTaskProgress,
    // Ideation phase actions
    captureIdeas,
    startIdeationSession,
    // Other exported actions...
  } = contentSlice.actions;
  
// Export selector for accessing the content items from the state
export const selectContentItems = (state: { content: ContentManagerState }) =>
  state.content.contentItems;

// Export reducer for the content entity slice
export default contentSlice.reducer;
export type { ContentManagerState };


