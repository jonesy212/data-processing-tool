// ContentSlice.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import * as ApiTask from "@/app/api/TasksApi";
import axiosInstance from "@/app/api/axiosInstance";
import headersConfig from "@/app/api/headers/HeadersConfig";
import { FileType } from "@/app/components/documents/Attachment/attachment";
import { SupportedData } from '@/app/components/models/CommonData';
import ContentDetails from "@/app/components/models/content/ContentDetails";
import {
    PriorityTypeEnum,
    StatusType,
    TaskStatus,
} from "@/app/components/models/data/StatusType";
import { Meta } from "@/app/components/models/data/dataStoreMethods";
import ExportTasksPayload from "@/app/components/models/tasks/ExportTasksPayload";
import ImportTasksPayload from "@/app/components/models/tasks/ImportTasksPayload";
import TaskDetails, { Task, TaskData } from "@/app/components/models/tasks/Task";
import { Phase } from "@/app/components/phases/Phase";
import { AnalysisTypeEnum } from "@/app/components/projects/DataAnalysisPhase/AnalysisType";
import { SortCriteria } from "@/app/components/settings/SortCriteria";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { SnapshotStoreConfig } from '@/app/components/snapshots/SnapshotConfig';
import SnapshotStore from "@/app/components/snapshots/SnapshotStore";
import { TaskSort } from "@/app/components/sort/TaskSort";
import { WritableDraft } from "@/app/components/state/redux/ReducerGenerator";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import useWebNotifications from "../../../hooks/commHooks/useWebNotifications";
import { ContentLogger } from "../../../logging/Logger";
import { ContentItem } from "../../../models/content/ContentItem";
import { BaseData, Comment, Data } from "../../../models/data/Data";
import { sanitizeInput } from "../../../security/SanitizationFunctions";
import {
    NotificationType,
    NotificationTypeEnum,
    useNotification,
} from "../../../support/NotificationContext";
import NOTIFICATION_MESSAGES from "../../../support/NotificationMessages";
import { Idea, IdeationSession } from "../../../users/Ideas";
import { User } from "../../../users/User";
import { VideoData } from "../../../video/Video";
import { DetailsItem } from "../../stores/DetailsListStore";
import { ProjectManagerStore } from "../../stores/ProjectStore";
const { showNotification } = useWebNotifications();
const { notify } = useNotification();

interface CompleteTaskPayload {
  taskId: string;
  userId: string;
}
interface ContentManagerState {
  name: string;
  contentItems: ContentItem[];
  actionStack: ContentItem[];
  redoStack: ContentItem[];
  contentTitle: string;
  userId: string;
  taskId: string;
  contentDescription: string;
  contentType: string;
  priority: PriorityTypeEnum;
  projectManager: ProjectManagerStore | null;
  pendingContent: ContentItem[]; // Initialize pendingContent array
  inProgressContent: ContentItem[]; // Initialize inProgressContent array
  completedContent: ContentItem[]; // Initialize completedContent array
  author: User;
  assignedTo: User[];
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
  users: User[];
  taskFilter: string;
  setAssignedUserFilter?: (userId: string) => void;
  asignedTo: Task["assignedTo"] | null;
  completedTasks: Task[];
  taskHistories: Task[];
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
  assignedTo: [],
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
  asignedTo: {} as Task["assignedTo"],
  [Symbol.iterator]: function (): Iterator<any, any, undefined> {
    throw new Error("Method not implemented.");
  },
  author: {
    id: "",
    username: "",
  } as User,
  taskFilter: "",
  userId: "",
  taskId: "",
  completedTasks: [],
  users: [],
  taskHistories: [],
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
    type: "text",
    userId: undefined,
    updatedAt: undefined
  };
  state.contentItems.push(newContent);
  ContentLogger.logEventToFile(
    "Content",
    "New content item generated with id: " + contentId,
    "content.log"
  );
  return newContent;
};

// Assuming TaskDetails has a structure similar to Task interface
interface TaskDetails {
  taskId: string;
  details: TaskDetails; // Partial to allow partial updates
}


function createUpdatedDetail(detail: DetailsItem<any>): WritableDraft<DetailsItem<any>> {
  return {
    ...detail,
    // Assuming the id, subtitle, and value are mandatory properties
    id: detail.id,
    subtitle: detail.subtitle,
    value: detail.value,
  } as WritableDraft<DetailsItem<any>>;
}

const API_BASE_URL = endpoints.conent;

const getTaskHistoryFromDatabaseAsync = async (
  taskId: string,
  previousState: any
): Promise<any> => {
  try {
    // Make API call to fetch task history
    const taskHistoryEndpoint = `${API_BASE_URL}/tasks/${taskId}/history`;
    const response: AxiosResponse<any> = await axiosInstance.get(
      taskHistoryEndpoint,
      { headers: headersConfig }
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching task history for task ${taskId}:`, error);
    throw error;
  }
};

export const useContentSlice = createSlice({
  name: "contentManager",
  initialState,
  reducers: {
    updateContentTitle: (state, action: PayloadAction<string>) => {
      state.contentTitle = action.payload;
    },

    updateContentDescription: (state, action: PayloadAction<string>) => {
      state.contentDescription = action.payload;
    },

    updateContentType: (state, action: PayloadAction<string>) => {
      state.contentType = action.payload;
    },

    updateContentDetails: (
      state,
      action: PayloadAction<{
        contentId: string;
        updatedDetails: Partial<ContentItem>;
      }>
    ) => {
      const { contentId, updatedDetails } = action.payload;
      const contentToUpdate = state.contentItems.find(
        (content) => content.id === contentId
      );

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
      const contentToUpdateIndex = state.contentItems.findIndex(
        (content) => content.id === id
      );

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

    updateTaskAssignee: (
      state,
      action: PayloadAction<{ taskId: string; assigneeId: string }>
    ) => {
      const { taskId, assigneeId } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        const task = state.tasks[taskIndex];
        const assignee = state.users.find((user) => user.id === assigneeId);

        if (task && assignee) {
          // Normalize assignedTo to an array for manipulation
          let assignedToArray: WritableDraft<User>[];

          if (Array.isArray(task.assignedTo)) {
            assignedToArray = task.assignedTo;
          } else if (task.assignedTo) {
            assignedToArray = [task.assignedTo];
          } else {
            assignedToArray = [];
          }

          // Check if the assignee is already in the array
          if (!assignedToArray.some((user) => user.id === assigneeId)) {
            assignedToArray.push(assignee);
          }

          // Assign the updated array back to assignedTo
          task.assignedTo =
            assignedToArray.length === 1 ? assignedToArray[0] : assignedToArray;
        }
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
        assignedTo: WritableDraft<User>[];
        userId: string;
        setAssignedUserFilter: boolean;
        priority: string;
        status: StatusType;
        updatedAt: Date | undefined
      } = {
        id: UniqueIDGenerator.generateContentID(id, title),
        heading: "",
        userId: state.userId,
        title: state.contentTitle,
        description: state.contentDescription,
        type: state.contentType as FileType,
        body: "",
        assignedTo: state.assignedTo, // Ensure assignedTo is correctly typed
        setAssignedUserFilter: state.data.setAssignedUserFilter,
        priority: state.priority,
        status: StatusType.Pending,
        updatedAt: undefined
      };

      state.pendingContent.push(newContent);
      state.contentTitle = "";
      state.contentDescription = "";

      state.pendingContent.push({
        ...newContent,
        status: StatusType.Pending,
        userId: undefined,
        updatedAt: undefined
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
    
      // Assuming you need the first assigned user's ID for `userId`
      const assignedUserId = state.assignedTo && state.assignedTo.length > 0 ? state.assignedTo[0]._id : "";
    
      const newContent: WritableDraft<ContentItem> = {
        id: generatedContentID,
        userId: assignedUserId,
        title,
        description: state.contentDescription,
        type: state.contentType as FileType,
        body: "",
        heading: "",
        status: StatusType.Pending,
        updatedAt: undefined
      };
    
      state.contentItems.push(newContent);
      
      // Log the first assigned user's ID
      const userId = state.assignedTo && state.assignedTo.length > 0 ? state.assignedTo[0].id : "";
      ContentLogger.logContentCreation("New Content", id, String(userId));
    
      if (generateNewContent) {
        const newGeneratedContent = generateNewContent(state, action);
        state.contentItems.push(newGeneratedContent);
      }
    
      state.contentTitle = "";
      state.contentDescription = "";
      state.contentType = "";
    },
    

    removeContent: (state, action: PayloadAction<string>) => {
      state.contentItems = state.contentItems.filter(
        (content) => content.id !== action.payload
      );
    },

    completeTask: (
      state: WritableDraft<ContentManagerState>,
      action: PayloadAction<CompleteTaskPayload>
    ) => {
      const { taskId, userId } = action.payload;
    
      // Find the task to complete
      const taskIndex = state.tasks.findIndex((task: WritableDraft<Task>) => task.id === taskId);
    
      if (taskIndex === -1) {
        return;
      }
    
      // Mark task as completed using the TaskStatus enum
      state.tasks[taskIndex].status = TaskStatus.Completed;
    
      // Log task completion
      ContentLogger.logTaskCompletion(taskId, userId);
    
      // Move completed task to completedTasks array
      state.completedTasks.push(state.tasks[taskIndex]);
    
      // Remove task from tasks array
      state.tasks.splice(taskIndex, 1);
    },

    updateTaskTitle: (
      state,
      action: PayloadAction<{ taskId: string; title: string }>
    ) => {
      const { taskId, title } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].title = title;
      }
    },

    updateTaskDescription: (
      state,
      action: PayloadAction<{ taskId: string; description: string }>
    ) => {
      const { taskId, description } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].description = description;
      }
    },

    updateTaskStatus: (
      state,
      action: PayloadAction<{ taskId: string; status: TaskStatus }>
    ) => {
      const { taskId, status } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
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
        type: NotificationTypeEnum;
      }>
    ) => {
      const { taskId, title, description, dueDate, status, type } = action.payload;
      // Generate a unique ID for the new task
      const generatedTaskID = UniqueIDGenerator.generateTaskID(taskId, title, type);
      // Add the new task
      state.tasks.push({
        id: generatedTaskID,
        title,
        description,
        dueDate,
        status,
        assignedTo: [],
        assigneeId: undefined,
        payload: undefined,
        priority: PriorityTypeEnum.Low,
        previouslyAssignedTo: [],
        done: false,
        data: {} as WritableDraft<TaskData>,
        source: "user",
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
        some: function (
          callbackfn: (value: Task, index: number, array: Task[]) => unknown,
          thisArg?: any
        ): boolean {
          throw new Error("Function not implemented.");
        },
        then: function (arg0: (newTask: any) => void): unknown {
          throw new Error("Function not implemented.");
        },
        getData: function (): Promise<SnapshotStore<Snapshot<Data, Data>>[]> {
          throw new Error("Function not implemented.");
        },
      });

      // Log task creation with the ID of the first user in assignedTo array if it exists
      const userId =
        state.assignedTo && state.assignedTo.length > 0
          ? state.assignedTo[0]._id
          : "";
      if (userId) {
        ContentLogger.logTaskCreation(
          generatedTaskID,
          title,
          description,
          userId
        );
      }
    },
    
    removeTask: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
    
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        const { title } = state.tasks[taskIndex];
        state.tasks.splice(taskIndex, 1);
    
        // Log task deletion with the ID of the first user in assignedTo array if it exists
        const userId = state.assignedTo && state.assignedTo.length > 0 ? state.assignedTo[0]._id : "";
        if (userId) {
          ContentLogger.logTaskDeletion(taskId, title, userId);
        }
      }
    },
    

    filterTasks: (state, action: PayloadAction<TaskStatus>) => {
      state.taskFilter = action.payload;

      switch (action.payload) {
        case TaskStatus.InProgress: // Use TaskStatus enum values directly
          state.tasks = state.tasks.filter(
            (task) => task.status !== TaskStatus.Completed
          );
          break;
        case TaskStatus.Completed: // Use TaskStatus enum values directly
          state.tasks = state.tasks.filter(
            (task) => task.status === TaskStatus.Completed
          );
          break;
        default:
          break;
      }
    },

    sortTasks: (state, action: PayloadAction<TaskSort>) => {
      // Extract the sorting criteria from the action payload
      const { criteria } = action.payload;

      // Sort tasks based on the criteria
      if (criteria === SortCriteria.Title) {
        // Sort tasks by title
        state.tasks.sort((a, b) => a.title.localeCompare(b.title));
      } else if (criteria === SortCriteria.Date) {
        // Sort tasks by date
        state.tasks.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      } else if (criteria === SortCriteria.Priority) {
        // Sort tasks by priority
        state.tasks.sort((a, b) => a.priority.localeCompare(b.priority));
      }
      // Sort tasks by status
      else if (criteria === SortCriteria.Status) {
        // Sort tasks by status
        state.tasks.sort((a, b) =>
          (a.status || "").localeCompare(b.status || "")
        );
      }
      // Add more conditions for other sorting criteria if needed
    },

     editTask:(
        state: WritableDraft<ContentManagerState>,
        action: PayloadAction<{
          completedContentId: string;
          changes: Partial<Task>;
          taskId: string;
        }>
      ) => {
        const { completedContentId, taskId, changes } = action.payload;
        
        const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
        
        if (taskIndex !== -1) {
          const existingTask = state.tasks[taskIndex];
          const updatedTask: WritableDraft<Task> = {
            ...existingTask,
            ...changes,
            assignedTo: changes.assignedTo
              ? Array.isArray(changes.assignedTo)
                ? changes.assignedTo.map((user) => ({ ...user } as WritableDraft<User>))
                : [changes.assignedTo as WritableDraft<User>]
              : existingTask.assignedTo,
            dependencies: changes.dependencies
              ? Array.isArray(changes.dependencies)
                ? changes.dependencies.map((dependency) => ({ ...dependency } as WritableDraft<Task>))
                : [changes.dependencies as WritableDraft<Task>]
              : existingTask.dependencies,
            previouslyAssignedTo: changes.previouslyAssignedTo
              ? Array.isArray(changes.previouslyAssignedTo)
                ? changes.previouslyAssignedTo.map((user) => ({ ...user } as WritableDraft<User>))
                : [changes.previouslyAssignedTo as WritableDraft<User>]
              : existingTask.previouslyAssignedTo,
            details: changes.details
              ? { ...changes.details } as WritableDraft<DetailsItem<TaskDetails>>
              : existingTask.details,
            subtasks: changes.subtasks
              ? Array.isArray(changes.subtasks)
                ? changes.subtasks.map((subtask) => ({ ...subtask } as WritableDraft<Task>))
                : [changes.subtasks as WritableDraft<Task>]
              : existingTask.subtasks,
            actions: changes.actions
              ? Array.isArray(changes.actions)
                ? changes.actions.map((action) => ({ ...action } as WritableDraft<SnapshotStoreConfig<BaseData, BaseData>>))
                : existingTask.actions
              : existingTask.actions,
            status: changes.status ?? existingTask.status,
            phase: changes.phase as WritableDraft<Phase> ?? existingTask.phase as WritableDraft<Phase>,
            comments: changes.comments
              ? Array.isArray(changes.comments) 
                ? changes.comments.map((comment) => ({ ...comment } as WritableDraft<Comment>))
                : [changes.comments as WritableDraft<Comment>] 
              : existingTask.comments,
            updatedDetails: changes.updatedDetails
              ? Array.isArray(changes.updatedDetails)
                ? changes.updatedDetails.map((updatedDetail) => createUpdatedDetail(updatedDetail))
                : [createUpdatedDetail(changes.updatedDetails) as WritableDraft<DetailsItem<SupportedData>>]
              : existingTask.updatedDetails,
            getData: changes.getData ?? existingTask.getData,
            updatedSubtasks: changes.updatedSubtasks
              ? Array.isArray(changes.updatedSubtasks)
                ? changes.updatedSubtasks.map((updatedSubtask) => ({ ...updatedSubtask } as WritableDraft<Task>))
                : [changes.updatedSubtasks as WritableDraft<Task>]
              : existingTask.updatedSubtasks,
            updatedActions: changes.updatedActions
              ? Array.isArray(changes.updatedActions)
                ? changes.updatedActions.map((updatedAction) => ({ ...updatedAction } as WritableDraft<SnapshotStoreConfig<BaseData, BaseData>>))
                : existingTask.updatedActions
              : existingTask.updatedActions,
            updatedComments: changes.updatedComments
              ? Array.isArray(changes.updatedComments)
                ? changes.updatedComments.map((updatedComment) => ({ ...updatedComment } as WritableDraft<Comment>))
                : [changes.updatedComments as WritableDraft<Comment>]
              : existingTask.updatedComments,
            updatedPhase: changes.updatedPhase
              ? changes.updatedPhase as WritableDraft<Phase>
              : existingTask.updatedPhase as WritableDraft<Phase>,
            updatedStatus: changes.updatedStatus ?? existingTask.updatedStatus,
          };
      
      // Update the task in the state
        state.tasks[taskIndex] = updatedTask;
    
        // Determine the userId
        const assignedUsers = updatedTask.assignedTo;
        const userId =
          assignedUsers && Array.isArray(assignedUsers) && assignedUsers.length > 0
            ? (assignedUsers[0] as User)._id
            : "";
    
        if (userId) {
          // Log content completion
          ContentLogger.logContentCompletion(completedContentId, taskId, userId);
    
          // Log task completion
          if (updatedTask.status === TaskStatus.Completed) {
            ContentLogger.logTaskCompletion(taskId, userId);
          }
    
          // Log task editing
          if (updatedTask.status !== TaskStatus.Completed) {
            ContentLogger.logTaskEditing(taskId, userId);
          }
    
          // Log task assignment
          if (assignedUsers) {
            ContentLogger.logTaskAssignment(taskId, userId);
          }
    
          // Log task deletion
          if (Array.isArray(assignedUsers) && assignedUsers.length === 0) {
            ContentLogger.logTaskDeletion(taskId, updatedTask.title, userId);
          }
    
          // Log task re-assignment
          if (
            Array.isArray(existingTask.assignedTo) &&
            existingTask.assignedTo.length > 0 &&
            Array.isArray(assignedUsers) &&
            assignedUsers.length > 0 &&
            existingTask.assignedTo[0]._id !== (assignedUsers[0] as User)._id
          ) {
            ContentLogger.logTaskReassignment(
              taskId,
              existingTask.assignedTo[0]._id ?? "",
              (assignedUsers[0] as User)._id ?? ""
            );
          }
        }
      }
    },
    
    
    

    searchTasks: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload;
      state.tasks = state.tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },

    assignTask: (
      state,
      action: PayloadAction<{ taskId: string; assigneeId: string }>
    ) => {
      const { taskId, assigneeId } = action.payload;
    
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
    
      if (taskIndex !== -1) {
        const assignee = state.users.find((user) => user.id === assigneeId);
        if (assignee) {
          state.tasks[taskIndex].assignedTo = [assignee]; // Assigning the assignee as an array
        }
      }
    },
    

    archiveTask: (
      state,
      action: PayloadAction<{
        taskId: string;
        archive: boolean;
      }>
    ) => {
      const { taskId, archive } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].archived = archive;
      }
    },

    undoAction: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].status = TaskStatus.InProgress;
      }
    },

    redoAction: (
      state,
      action: PayloadAction<{
        taskId: string;
        changes: Partial<Task>;
      }>
    ) => {
      const { taskId, changes } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...changes,
          assignedTo: changes.assignedTo
            ? (changes.assignedTo as (User | WritableDraft<User>)[]).map(
                (user) => user as WritableDraft<User>
              )
            : state.tasks[taskIndex].assignedTo,
        };

        // Log content completion
        const userId =
          state.tasks[taskIndex].assignedTo &&
          Array.isArray(state.tasks[taskIndex].assignedTo) &&
          state.tasks[taskIndex].assignedTo.length > 0
            ? (state.tasks[taskIndex].assignedTo[0] as WritableDraft<User>)?._id
            : undefined;
        if (userId && state.tasks[taskIndex].contentId) {
          const contentId = state.tasks[taskIndex].contentId;
          ContentLogger.logContentCompletion(contentId, taskId, userId);
        }

        // Check if notification permission is granted before displaying notification
        if (!("Notification" in window)) {
          notify(
            "completedContent",
            "Desktop notification permission required.",
            NOTIFICATION_MESSAGES.Notifications.DEFAULT,
            new Date(),
            "Error" as NotificationType
          );
          return;
        }
      }
    },
    

    exportTasks: (state, action: PayloadAction<ExportTasksPayload>) => {
      const { tasks } = action.payload;

      tasks.forEach((task: Task) => {
        const taskIndex = state.tasks.findIndex((t) => t.id === task.id);

        if (taskIndex !== -1) {
          state.tasks[taskIndex] = {
            ...state.tasks[taskIndex],
            ...task,
            previouslyAssignedTo: task.previouslyAssignedTo
              ? (task.previouslyAssignedTo as User[]).map(
                  (user) => user as WritableDraft<User>
                )
              : [],
            phase: task.phase ? (task.phase as WritableDraft<Phase>) : null,
            data: task.data as WritableDraft<TaskData>,
            assignedTo: task.assignedTo
              ? (task.assignedTo as User[]).map(
                  (user) => user as WritableDraft<User>
                )
              : [],
            dependencies: task.dependencies
              ? task.dependencies.map(
                  (dependency) => dependency as WritableDraft<Task>
                )
              : null,
          } as WritableDraft<Task>;
        }
      });
    },

    importTasks: (state, action: PayloadAction<ImportTasksPayload>) => {
      const { tasks } = action.payload;

      tasks.forEach((task: Task) => {
        if (!state.tasks.find((t) => t.id === task.id)) {
          state.tasks.push(task as WritableDraft<Task>);
        }
      });
    },

    updateTaskDetails: (
      state: WritableDraft<ContentManagerState>,
      action: PayloadAction<TaskDetails & {
        assignedTo?: User[];
        dependencies?: Task[];
        previouslyAssignedTo?: User[];
        phase?: Phase;
        id: string;
        updates: TaskDetails;
        subtitle: string;
        value: number;
      }>
    ) => {
      const { taskId, details, assignedTo, dependencies, previouslyAssignedTo, phase, id, subtitle, value } = action.payload;
    
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
    
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...details,
          id,
          subtitle,
          value,
          assignedTo: assignedTo
            ? assignedTo.map((user: User) => user as WritableDraft<User>)
            : [],
          dependencies: dependencies
            ? dependencies.map((dependency: Task) => dependency as WritableDraft<Task>)
            : null,
          previouslyAssignedTo: previouslyAssignedTo
            ? previouslyAssignedTo.map((user: User) => user as WritableDraft<User>)
            : [],



          phase: phase ? (phase as WritableDraft<Phase>) : null,
        };
      }
    },
    updateTaskTags: (
      state,
      action: PayloadAction<{ taskId: string; tags: string[] }>
    ) => {
      const { taskId, tags } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].tags = tags;
      }
    },

    updateTaskDueDate: (
      state,
      action: PayloadAction<{ taskId: string; dueDate: Date }>
    ) => {
      const { taskId, dueDate } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].dueDate = dueDate;
      }
    },

    updateTaskPriority: (
      state,
      action: PayloadAction<{
        taskId: string;
        priority: PriorityTypeEnum;
      }>
    ) => {
      const { taskId, priority } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].priority = priority;
      }
    },

    addTaskDependency: (
      state,
      action: PayloadAction<{
        taskId: string;
        dependencyTaskId: WritableDraft<Task>;
      }>
    ) => {
      const { taskId, dependencyTaskId } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].dependencies = [
          ...(state.tasks[taskIndex].dependencies || []),
          dependencyTaskId,
        ];
      }
    },

    removeTaskDependency: (
      state,
      action: PayloadAction<{ taskId: string; dependencyTaskId: string }>
    ) => {
      const { taskId, dependencyTaskId } = action.payload;
      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].dependencies = state.tasks[
          taskIndex
        ].dependencies?.filter((dep) => dep.id !== dependencyTaskId);
      }
    },

    addTaskComment: (
      state,
      action: PayloadAction<{ taskId: string; comment: TaskComment }>
    ) => {
      const { taskId, comment } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].comments = [
          ...(state.tasks[taskIndex].comments || []),
          comment,
        ];
      }
    },

    removeTaskComment: (
      state,
      action: PayloadAction<{
        taskId: string;
        commentIndex: number;
      }>
    ) => {
      const { taskId, commentIndex } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].comments?.splice(commentIndex, 1);
      }
    },

    getTaskHistory: (state, action: PayloadAction<string>) => {
      const taskId = action.payload;
      // Call API to get task history
      const taskHistory = ApiTask.getTaskHistory(taskId);
      // Update state with task history
      state.taskHistories = {
        ...state.taskHistories,
        [taskId]: taskHistory,
      };

      return state;
    },

    revertToPreviousState: (
      state,
      action: PayloadAction<{
        taskId: string;
        previousState: Partial<Task>;
      }>
    ) => {
      const { taskId, previousState } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          ...previousState,
        };
      }
    },

    // Define the action
    markTaskAsInProgress: (
      state,
      action: PayloadAction<{
        taskId: string;
      }>
    ) => {
      const { taskId } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        // Update task status to "inProgress"
        state.tasks[taskIndex].status = "inProgress";

        // Save the current task state to history
        const previousState = { ...state.tasks[taskIndex] };

        // Call the function to fetch task history from the database
        getTaskHistoryFromDatabaseAsync(taskId, previousState)
          .then(() => {
            // Check if user has granted notification permission
            if (Notification.permission === "granted") {
              // Display success notification
              notify(
                "taskInProgress",
                `Task marked as in progress.`,
                NOTIFICATION_MESSAGES.Notifications.DEFAULT,
                new Date(),
                "Success" as NotificationType
              );
            }
          })
          .catch((error) => {
            // Handle error if needed
            console.error("Error fetching task history:", error);
          });
      }
    },

   markTaskAsCompleted: (
      state,
      action: PayloadAction<{
        taskId: string;
      }>
    ) => {
     const { taskId } = action.payload;
     const taskIndex = state.tasks.findIndex((task) => task.id === taskId);
     if (taskIndex !== -1) {
       // Update task status to "completed"
       state.tasks[taskIndex].status = "completed";
       // Save the current task state to history
       const previousState = { ...state.tasks[taskIndex] };
       // Call the function to fetch task history from the database
       getTaskHistoryFromDatabaseAsync(taskId, previousState)
         .then(() => {
         // Check if user has granted notification permission
         if (Notification.permission === "granted") {
           // Display success notification
           notify(
             "taskCompleted",
             `Task marked as completed.`,
             NOTIFICATION_MESSAGES.Notifications.DEFAULT,
             new Date(),
             "Success" as NotificationType
           );
         }
         })
         .catch((error) => {
           // Handle error if needed
           console.error("Error fetching task history:", error);
         });
     }
    },

    batchFetchTaskSnapshots: (
      state,
      action: PayloadAction<{ taskIds: string[] }>
    ) => {
      const { taskIds } = action.payload;

      // Perform batch fetch of task snapshots
      // Implementation depends on the specific API or data source
      // Example:
      // const taskSnapshots = await ApiTask.batchFetchTaskSnapshots(taskIds);

      // Update state with fetched task snapshots
      // state.taskSnapshots = taskSnapshots;
    },

    updateTaskProgress: (
      state,
      action: PayloadAction<{ taskId: string; progress: number }>
    ) => {
      const { taskId, progress } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].progress = progress;
      }
    },

    captureIdeas: (
      state,
      action: PayloadAction<{ taskId: string; ideas: WritableDraft<Idea>[] }>
    ) => {
      const { taskId, ideas } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].ideas = ideas;
      }
    },

    startIdeationSession: (
      state,
      action: PayloadAction<{ taskId: string; sessionDetails: IdeationSession }>
    ) => {
      const { taskId, sessionDetails } = action.payload;

      const taskIndex = state.tasks.findIndex((task) => task.id === taskId);

      if (taskIndex !== -1) {
        state.tasks[taskIndex].ideationSession = sessionDetails;
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
} = useContentSlice.actions;

// Export selector for accessing the content items from the state
export const selectContentItems = (state: { content: ContentManagerState }) =>
  state.content.contentItems;

// Export reducer for the content entity slice
export default useContentSlice.reducer;
export type { ContentManagerState };
