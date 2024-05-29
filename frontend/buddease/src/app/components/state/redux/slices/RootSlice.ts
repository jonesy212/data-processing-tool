// rootSlice.ts
import { combineReducers, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../../../models/tasks/Task";
import { Tracker } from "../../../models/tracker/Tracker";
import { userManagerSlice } from "../../../users/UserSlice";
import { useDataAnalysisManagerSlice } from "./DataAnalysisSlice";
import { useTodoManagerSlice } from "./TodoSlice";
import { trackerManagerSlice } from "./TrackerSlice";
// Import uuid
import { useCalendarManagerSlice } from "@/app/components/calendar/CalendarSlice";
import { Data } from "@/app/components/models/data/Data";
import { useRealtimeDataSlice } from "@/app/components/state/redux/slices/RealtimeDataSlice";
import { useProjectOwnerSlice } from "@/app/components/users/ProjectOwnerSlice";

import {
  PriorityStatus,
  StatusType,
} from "@/app/components/models/data/StatusType";
import { AnalysisTypeEnum } from "@/app/components/projects/DataAnalysisPhase/AnalysisType";
import { VideoData } from "@/app/components/video/Video";
import { createDraft } from "immer";
import { v4 as uuidv4 } from "uuid";
import { implementThen } from "../../stores/CommonEvent";
import { useUIManagerSlice } from "../../stores/UISlice";
import { Video } from "../../stores/VideoStore";
import { WritableDraft } from "../ReducerGenerator";
import { useApiManagerSlice } from "./ApiSlice";
import { useAppManagerSlice } from "./AppSlice";
import { useBlogManagerSlice } from "./BlogSlice";
import { useCollaborationSlice } from "./CollaborationSlice";
import { useDataManagerSlice } from "./DataSlice";
import { useDocumentManagerSlice } from "./DocumentSlice";
import { useDrawingManagerSlice } from "./DrawingSlice";
import { useEntityManagerSlice } from "./EntitySlice";
import { useEventManagerSlice } from "./EventSlice";
import { useFilteredEventsSlice } from "./FilteredEventsSlice";
import { filterReducer } from "./FilterSlice";
import { useHistorySlice } from "./HistorySlice";
import { useNotificationManagerSlice } from "./NotificationSlice";
import { usePagingManagerSlice } from "./pagingSlice";
import { usePhaseManagerSlice } from "./phaseSlice";
import { useProjectManagerSlice } from "./ProjectSlice";
import { useRandomWalkManagerSlice } from "./RandomWalkManagerSlice";
import { useSettingsManagerSlice } from "./SettingsSlice";
import { useTaskManagerSlice } from "./TaskSlice";
import { useTeamManagerSlice } from "./TeamSlice";
import { useToolbarManagerSlice } from "./toolbarSlice";
import { useVersionManagerSlice } from "./VersionSlice";
import { useVideoManagerSlice } from "./VideoSlice";
import { HistoryItem } from "../sagas/UndoRedoSaga";
const randomTaskId = uuidv4().toString();

// Define your custom entity state
interface CustomEntityState<T, Id extends string> extends EntityState<T, Id> {
  entities: Record<Id, T>;
  selectedEntityId: Id | null;
}

// Define the EntityState interface if not already defined
interface EntityState<T, Id extends string> {
  // Define EntityState properties here
}

// Define your EntityId type if not already defined
export type EntityId = string;
export interface RootState {
  history: HistoryItem[],
  // User Interface
  appManager: ReturnType<typeof useAppManagerSlice.reducer>;
  toolbarManager: ReturnType<typeof useToolbarManagerSlice.reducer>;
  uiManager: ReturnType<typeof useUIManagerSlice.reducer>;
  // Project Management
  projectManager: ReturnType<typeof useProjectManagerSlice.reducer>;
  taskManager: ReturnType<typeof useTaskManagerSlice.reducer>;
  trackerManager: ReturnType<typeof trackerManagerSlice.reducer>;
  userManager: ReturnType<typeof userManagerSlice.reducer>;
  teamManager: ReturnType<typeof useTeamManagerSlice.reducer>;
  projectOwner: ReturnType<typeof useProjectOwnerSlice.reducer>;

  // Data Management
  dataManager: ReturnType<typeof useDataManagerSlice.reducer>;
  dataAnalysisManager: ReturnType<typeof useDataAnalysisManagerSlice.reducer>;
  calendarManager: ReturnType<typeof useCalendarManagerSlice.reducer>;
  todoManager: ReturnType<typeof useTodoManagerSlice.reducer>;
  documentManager: ReturnType<typeof useDocumentManagerSlice.reducer>;
  userTodoManager: ReturnType<typeof userManagerSlice.reducer>;
  phaseManager: ReturnType<typeof usePhaseManagerSlice.reducer>;

  // API & Networking
  apiManager: ReturnType<typeof useApiManagerSlice.reducer>;
  realtimeManager: ReturnType<typeof useRealtimeDataSlice.reducer>;

  // Event & Collaboration
  eventManager: ReturnType<typeof useEventManagerSlice.reducer>;
  collaborationManager: ReturnType<typeof useCollaborationSlice.reducer>;

  // Entity & Notification
  entityManager: ReturnType<typeof useEntityManagerSlice.reducer>;
  notificationManager: ReturnType<typeof useNotificationManagerSlice.reducer>;

  // Settings & Utilities
  settingsManager: ReturnType<typeof useSettingsManagerSlice.reducer>;

  // Miscellaneous
  videoManager: ReturnType<typeof useVideoManagerSlice.reducer>;
  randomWalkManager: ReturnType<typeof useRandomWalkManagerSlice.reducer>;
  pagingManager: ReturnType<typeof usePagingManagerSlice.reducer>;
  blogManager: ReturnType<typeof useBlogManagerSlice.reducer>;
  drawingManager: ReturnType<typeof useDrawingManagerSlice.reducer>;
  versionManager: ReturnType<typeof useVersionManagerSlice.reducer>;
  filterManager: ReturnType<typeof useFilteredEventsSlice.reducer>;
  historyManager: ReturnType<typeof useHistorySlice.reducer>;
}

const initialState: RootState = {
  appManager: useAppManagerSlice.reducer(undefined, { type: "init" }),
  toolbarManager: useToolbarManagerSlice.reducer(undefined, { type: "init" }),
  projectManager: useProjectManagerSlice.reducer(undefined, {
    type: "init",
  }),
  dataManager: useDataManagerSlice.reducer(undefined, { type: "init" }),
  taskManager: useTaskManagerSlice.reducer(undefined, { type: "init" }),
  trackerManager: trackerManagerSlice.reducer(undefined, { type: "init" }),
  userManager: userManagerSlice.reducer(undefined, { type: "init" }),
  dataAnalysisManager: useDataAnalysisManagerSlice.reducer(undefined, {
    type: "init",
  }),
  calendarManager: useCalendarManagerSlice.reducer(undefined, { type: "init" }),
  todoManager: useTodoManagerSlice.reducer(undefined, { type: "init" }),
  documentManager: useDocumentManagerSlice.reducer(undefined, { type: "init" }),
  userTodoManager: userManagerSlice.reducer(undefined, { type: "init" }),
  apiManager: useApiManagerSlice.reducer(undefined, { type: "init" }),
  randomWalkManager: useRandomWalkManagerSlice.reducer(undefined, {
    type: "init",
  }),
  versionManager: useVersionManagerSlice.reducer(undefined, { type: "init" }),
  pagingManager: usePagingManagerSlice.reducer(undefined, { type: "init" }),
  videoManager: useVideoManagerSlice.reducer(undefined, { type: "init" }),
  teamManager: useTeamManagerSlice.reducer(undefined, { type: "init" }),
  projectOwner: useProjectOwnerSlice.reducer(undefined, { type: "init" }),
  realtimeManager: useRealtimeDataSlice.reducer(undefined, { type: "init" }),
  eventManager: useEventManagerSlice.reducer(undefined, { type: "init" }),
  collaborationManager: useCollaborationSlice.reducer(undefined, {
    type: "init",
  }),
  entityManager: useEntityManagerSlice.reducer(undefined, { type: "init" }),
  notificationManager: useNotificationManagerSlice.reducer(undefined, {
    type: "init",
  }),
  settingsManager: useSettingsManagerSlice.reducer(undefined, { type: "init" }),
  blogManager: useBlogManagerSlice.reducer(undefined, { type: "init" }),
  drawingManager: useDrawingManagerSlice.reducer(undefined, { type: "init" }),
  uiManager: useUIManagerSlice.reducer(undefined, { type: "init" }),
  phaseManager: usePhaseManagerSlice.reducer(undefined, { type: "init" }),
  filterManager: useFilteredEventsSlice.reducer(undefined, { type: "init" }),
  historyManager: useHistorySlice.reducer(undefined, { type: "init" }),
};

const rootReducerSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    // Add common actions here if needed
  },
  extraReducers: (builder) => {
    builder.addCase(
      useTaskManagerSlice.actions.updateTaskTitle,
      (state, action: PayloadAction<{ id: string; title: string }>) => {
        const taskToUpdate = state.taskManager.tasks.find(
          (task) => task.id === action.payload.id
        );
        if (taskToUpdate) {
          taskToUpdate.title = action.payload.title;
        }
      }
    ),
      builder.addCase(
        useTaskManagerSlice.actions.updateTaskDescription,
        (state, action: PayloadAction<{ id: string; description: string }>) => {
          const { id, description } = action.payload;
          const taskToUpdate = state.taskManager.tasks.find(
            (task: WritableDraft<Task>) => task.id === id
          );

          if (taskToUpdate) {
            taskToUpdate.description = description;
          }
        }
      );
    builder.addCase(
      useTaskManagerSlice.actions.updateTaskStatus,
      (state, action: PayloadAction<{ id: string; status: string }>) => {
        const { id, status } = action.payload;
        const taskToUpdate = state.taskManager.tasks.find(
          (task: WritableDraft<Task>) => task.id === id
        );
        if (taskToUpdate) {
          taskToUpdate.status = status;
        }
      }
    );
    builder.addCase(
      useTaskManagerSlice.actions.updateTaskDetails,
      (
        state,
        action: PayloadAction<{
          id: string;
          updates: {
            title?: string;
            description?: string;
          };
        }>
      ) => {
        // Handle the action for updating task details
        const { id, updates } = action.payload;
        const taskToUpdate = state.taskManager.tasks.find(
          (task) => task.id === id
        );

        if (taskToUpdate) {
          // Update the task details
          if (updates.title) {
            taskToUpdate.title = updates.title;
          }
          if (updates.description) {
            taskToUpdate.description = updates.description;
          }
        }
      }
    );

    builder.addCase(useTaskManagerSlice.actions.addTask, (state) => {
      // Handle the action for adding a task
      const newTask: Task = {
        _id: "newTaskId2",
        id: randomTaskId, // generate unique id
        name: "",
        title: "",
        description: "",
        assignedTo: [], // Assign an empty array to fix the error
        dueDate: new Date(), // Changed to Date object
        status: StatusType.Pending,
        priority: "medium",
        estimatedHours: 0,
        actualHours: 0,
        startDate: new Date(),
        completionDate: new Date(),
        endDate: new Date(),
        isActive: false,
        tags: [],
        dependencies: [],
        then: function (onFulfill: (newTask: Task) => void): unknown {
          // Example implementation: Call onFulfill with the new task after some asynchronous operation
          setTimeout(() => {
            return onFulfill(newTask);
          }, 1000);
          return this; // Return the current object for chaining if needed
        },
        previouslyAssignedTo: [],
        done: false,
        analysisType: AnalysisTypeEnum.TASK,
        analysisResults: [],
        data: {} as Data,
        source: "user",
        // Implementation of some method
        some(
          callbackfn: (value: Task, index: number, array: Task[]) => unknown,
          thisArg?: any
        ): boolean {
          // Check if 'this' is an array
          if (Array.isArray(this)) {
            for (let i = 0; i < this.length; i++) {
              if (callbackfn(this[i], i, this)) {
                return true;
              }
            }
            return false;
          } else {
            throw new Error("'some' method can only be used on arrays.");
          }
        },

        [Symbol.iterator](): IterableIterator<any> {
          // Check if 'this' is an object
          if (typeof this === "object" && this !== null) {
            const taskKeys = Object.keys(this);
            let index = 0;
            return {
              next: () => {
                if (index < taskKeys.length) {
                  const key = taskKeys[index++] as keyof Task; // Explicitly specify the type of 'key' as keyof Task
                  return { value: this[key], done: false };
                } else {
                  return { value: undefined, done: true };
                }
              },
              [Symbol.iterator]: function () {
                return this;
              },
            };
          } else {
            throw new Error("'Symbol.iterator' can only be used on objects.");
          }
        },
        phase: null,
        videoData: {} as VideoData,
        assigneeId: "",
        payload: undefined,
        type: "addTask",
        videoThumbnail: "",
        videoDuration: 0,
        videoUrl: "",
        ideas: [],
      };
      state.taskManager.tasks.push(newTask as WritableDraft<Task>);
    });
    builder.addCase(useTaskManagerSlice.actions.addTask, (state) => {
      // Handle the action for adding a task
      const newTaskId = uuidv4();
      const newTask: Task = {
        id: newTaskId,
        title: state.taskManager.taskTitle,
        description: state.taskManager.taskDescription,
        status: state.taskManager.taskStatus,
        assignedTo: [],
        dueDate: new Date(),
        priority: "medium",
        isActive: false,
        tags: [],
        previouslyAssignedTo: [],
        done: false,
        analysisType: AnalysisTypeEnum.TASK,
        analysisResults: [],
        data: {} as VideoData & Data,
        source: "user",
        phase: null,
        videoData: {} as VideoData,
        assigneeId: "",
        type: "addTask",
        startDate: new Date(),
        endDate: new Date(),
        videoThumbnail: "",
        videoDuration: 0,
        videoUrl: "",
        ideas: [],
        payload: undefined,
        some: function (
          callbackfn: (value: Task, index: number, array: Task[]) => unknown,
          thisArg?: any
        ): boolean {
          if (Array.isArray(this)) {
            for (let i = 0; i < this.length; i++) {
              if (callbackfn(this[i], i, this)) {
                return true;
              }
            }
          } else {
            throw new Error("'some' method can only be used on arrays.");
          }
          return false;
        },
        then: implementThen,
        [Symbol.iterator]: function (): Iterator<any, any, undefined> {
          throw new Error("Function not implemented.");
        },
      };
      state.taskManager.tasks.push(newTask as WritableDraft<Task>);
      state.taskManager.taskTitle = "";
      state.taskManager.taskDescription = "";
      state.taskManager.taskStatus = PriorityStatus.PendingReview;
      state.taskManager.priority = PriorityStatus.Medium;
      state.taskManager.dueDate = new Date();
    });

    // Add other slices as needed

    // Inside your reducer function
    builder.addCase(
      trackerManagerSlice.actions.addTracker,
      (state, action: PayloadAction<Tracker>) => {
        // Create a draft of the payload
        const draftPayload = createDraft(action.payload);
        // Push the draft into the trackers array
        state.trackerManager.trackers.push(draftPayload);
      }
    );
    // Add video-related actions
    builder.addCase(
      useVideoManagerSlice.actions.setVideos,
      (state, action: PayloadAction<WritableDraft<Video>[]>) => {
        state.videoManager.videos = action.payload;
      }
    );
    builder.addCase(
      useVideoManagerSlice.actions.setCurrentVideoId,
      (state, action: PayloadAction<string | null>) => {
        state.videoManager.currentVideoId = action.payload;
      }
    );
    builder.addCase(
      useVideoManagerSlice.actions.updateVideoThumbnail,
      (state, action: PayloadAction<{ id: string; newThumbnail: string }>) => {
        const { id, newThumbnail } = action.payload;
        const videoIndex = state.videoManager.videos.findIndex(
          (video) => video.id === id
        );
        if (videoIndex !== -1) {
          state.videoManager.videos[videoIndex].thumbnailUrl = newThumbnail;
        }
      }
    );
    builder.addCase(
      useVideoManagerSlice.actions.updateVideoTitle,
      (state, action: PayloadAction<{ id: string; newTitle: string }>) => {
        const { id, newTitle } = action.payload;
        const videoIndex = state.videoManager.videos.findIndex(
          (video) => video.id === id
        );
        if (videoIndex !== -1) {
          state.videoManager.videos[videoIndex].title = newTitle;
        }
      }
    );
    builder.addCase(
      useVideoManagerSlice.actions.updateVideoDescription,
      (
        state,
        action: PayloadAction<{ id: string; newDescription: string }>
      ) => {
        const { id, newDescription } = action.payload;
        const videoIndex = state.videoManager.videos.findIndex(
          (video) => video.id === id
        );
        if (videoIndex !== -1) {
          state.videoManager.videos[videoIndex].description = newDescription;
        }
      }
    );
  },
});

// Combine reducers
const rootReducer = combineReducers({
  root: rootReducerSlice.reducer,
  dataManager: useDataManagerSlice.reducer,
  taskManager: useTaskManagerSlice.reducer,
  trackerManager: trackerManagerSlice.reducer,
  userManager: userManagerSlice.reducer,
  dataAnalysisManager: useDataAnalysisManagerSlice.reducer,
  calendarManager: useCalendarManagerSlice.reducer,
  todoManager: useTodoManagerSlice.reducer,
  videoManager: useVideoManagerSlice.reducer,
  projectManager: useProjectManagerSlice.reducer,
  documentManager: useDocumentManagerSlice.reducer,
  apiManager: useApiManagerSlice.reducer,
  randomWalkManager: useRandomWalkManagerSlice.reducer,
  pagingManager: usePagingManagerSlice.reducer,
  teamManager: useTeamManagerSlice.reducer,
  projectOwner: useProjectOwnerSlice.reducer,
  realtimeManager: useRealtimeDataSlice.reducer,
  eventManager: useEventManagerSlice.reducer,
  collaborationManager: useCollaborationSlice.reducer,
  entityManager: {} as CustomEntityState<string, string>,
  notificationManager: useNotificationManagerSlice.reducer,
  settingsManager: useSettingsManagerSlice.reducer,
  blogManager: useBlogManagerSlice.reducer,
  filterManager: filterReducer,
  // todo create code for
  // tagManager: useTagManagerSlice.reducer,
  // bookmarkManager: useBookmarkManagerSlice.reducer,

  // Add other slices as needed
});

// Export selectors for accessing state from slices
export const selectTaskManager = (state: RootState) => state.taskManager;
export const selectTrackers = (state: RootState) => state.trackerManager;
export const selectCalendarManager = (state: RootState) =>
  state.calendarManager;
export const selectDataAnalysisManager = (state: RootState) =>
  state.dataAnalysisManager;
// Add other selectors as needed

export default rootReducer;
export { initialState };
