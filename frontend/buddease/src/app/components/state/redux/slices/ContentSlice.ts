// ContentSlice.ts
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import FileSaver from "file-saver";
import * as Papa from "papaparse";
import { NamingConventionsError } from "shared_error_handling";
import * as XLSX from "xlsx";
import useWebNotifications from "../../../hooks/commHooks/useWebNotifications";
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
import { WritableDraft } from "../ReducerGenerator";
import { PriorityTypeEnum } from "@/app/components/models/data/StatusType";
import { AnalysisTypeEnum } from "@/app/components/projects/DataAnalysisPhase/AnalysisType";

const { showNotification } = useWebNotifications();
const { notify } = useNotification();
interface ContentManagerState {
    name: string;
    contentItems: ContentItem[];
    actionStack: ContentItem[];
    redoStack: ContentItem[];
    contentTitle: string;
    contentDescription: string;
    contentType: string;
    priority: PriorityTypeEnum;
    projectManager: ProjectManagerStore | null;
    pendingContent: ContentItem[]; // Initialize pendingContent array
    inProgressContent: ContentItem[]; // Initialize inProgressContent array
    completedContent: ContentItem[]; // Initialize completedContent array
    author: User;
  assignedTo: WritableDraft<User>;
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
    [Symbol.iterator]: function (): Iterator<any, any, undefined> {
      throw new Error("Method not implemented.");
        },
    author: {
      id: "",
      username: ""
    }
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

    addContent: (
      state,
      action: PayloadAction<{ id: string; title: string; isComplete: boolean }>
    ) => {
      const { id, title } = action.payload;
      // Generate a unique ID for the new content
      const generatedContentID = UniqueIDGenerator.generateContentID(id, title);

      // Ensure content title is not empty
      if (sanitizeInput(state.contentTitle.trim()) === "") {
        console.error("Content title cannot be empty.");
        return;
      }

      const newContent: WritableDraft<ContentItem> = {
        id: generatedContentID,
        userId: state.assignedTo
        title,
        description: state.contentDescription,
        type: state.contentType,
        body: "",
        heading: "",
      } as WritableDraft<ContentItem>;

      state.contentItems.push(newContent);
      const userId = state.assignedTo._id
      ContentLogger.logContentCreation("New Content", id, userId!);

      generateNewContent().then((newContent: any) => {
        state.contentItems.push(newContent);
      });

      state.contentTitle = "";
      state.contentDescription = "";
      state.contentType = "";
    },

    removeContent: (state, action: PayloadAction<string>) => {
      state.contentItems = state.contentItems.filter((content) => content.id !== action.payload);
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


