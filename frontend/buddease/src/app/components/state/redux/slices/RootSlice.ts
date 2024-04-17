// rootSlice.ts
import { combineReducers, createSlice, EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../../../models/tasks/Task";
import { Tracker } from "../../../models/tracker/Tracker";
import { userManagerSlice } from "../../../users/UserSlice";
import { useDataAnalysisManagerSlice } from "./DataAnalysisSlice";
import { taskManagerSlice } from "./TaskSlice";
import { useTodoManagerSlice } from "./TodoSlice";
import { trackerManagerSlice } from "./TrackerSlice";
// Import uuid
import { useCalendarManagerSlice } from "@/app/components/calendar/CalendarSlice";
import { Data } from "@/app/components/models/data/Data";
import { useRealtimeDataSlice } from "@/app/components/RealtimeDataSlice";
import { useProjectOwnerSlice } from "@/app/components/users/ProjectOwnerSlice";

import { StatusType } from "@/app/components/models/data/StatusType";
import { User } from "@/app/components/users/User";
import { VideoData } from "@/app/components/video/Video";
import { createDraft } from "immer";
import { v4 as uuidv4 } from "uuid";
import { Video } from "../../stores/VideoStore";
import { WritableDraft } from "../ReducerGenerator";
import { useApiManagerSlice } from "./ApiSlice";
import { useDataManagerSlice } from "./DataSlice";
import { useDocumentManagerSlice } from "./DocumentSlice";
import { useEventManagerSlice } from "./EventSlice";
import { usePagingManagerSlice } from './pagingSlice';
import { useProjectManagerSlice } from "./ProjectSlice";
import { useRandomWalkManagerSlice } from "./RandomWalkManagerSlice";
import { useTeamManagerSlice } from './TeamSlice';
import { useToolbarManagerSlice } from "./toolbarSlice";
import { useVideoManagerSlice } from "./VideoSlice";
import { useCollaborationSlice } from "./CollaborationSlice";
const randomTaskId = uuidv4().toString();



interface CustomEntityState<T, Id extends EntityId> extends EntityState<T, Id> {
  selectedEntityId: Id | null;
}
export interface RootState {
  toolbarManager: ReturnType<typeof useToolbarManagerSlice.reducer>;
  useProjectManager: ReturnType<typeof useProjectManagerSlice.reducer>;
  userTodoManager: ReturnType<typeof userManagerSlice.reducer>;
  todoManager: ReturnType<typeof useTodoManagerSlice.reducer>;
  taskManager: ReturnType<typeof taskManagerSlice.reducer>;
  trackerManager: ReturnType<typeof trackerManagerSlice.reducer>;
  userManager: ReturnType<typeof userManagerSlice.reducer>;
  dataAnalysisManager: ReturnType<typeof useDataAnalysisManagerSlice.reducer>;
  dataManager: ReturnType<typeof useDataManagerSlice.reducer>;
  calendarManager: ReturnType<typeof useCalendarManagerSlice.reducer>;
  documentManager: ReturnType<typeof useDocumentManagerSlice.reducer>;
  apiManager: ReturnType<typeof useApiManagerSlice.reducer>;
  videoManager: ReturnType<typeof useVideoManagerSlice.reducer>;
  randomWalkManager: ReturnType<typeof useRandomWalkManagerSlice.reducer>;
  pagingManager: ReturnType<typeof usePagingManagerSlice.reducer>;
  teamManager: ReturnType<typeof useTeamManagerSlice.reducer>;
  projectOwner: ReturnType<typeof useProjectOwnerSlice.reducer>;
  realtimeManager: ReturnType<typeof useRealtimeDataSlice.reducer>;
  eventManager: ReturnType<typeof useEventManagerSlice.reducer>;
  collaborationManager: ReturnType<typeof useCollaborationSlice.reducer>;
  entityManager: CustomEntityState<string, string>; // Use EntityState<string, unknown> for entityManager
}



const initialState: RootState = {
  toolbarManager: useToolbarManagerSlice.reducer(undefined, { type: "init" }),
  useProjectManager: useProjectManagerSlice.reducer(undefined, {
    type: "init",
  }),
  dataManager: useDataManagerSlice.reducer(undefined, { type: "init" }),
  taskManager: taskManagerSlice.reducer(undefined, { type: "init" }),
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
  pagingManager: usePagingManagerSlice.reducer(undefined, { type: "init" }),
  videoManager: useVideoManagerSlice.reducer(undefined, { type: "init" }),
  teamManager: useTeamManagerSlice.reducer(undefined, { type: "init" }),
  projectOwner: useProjectOwnerSlice.reducer(undefined, { type: "init" }),
  realtimeManager: useRealtimeDataSlice.reducer(undefined, { type: "init" }),
  eventManager: useEventManagerSlice.reducer(undefined, { type: "init" }),
  collaborationManager: useCollaborationSlice.reducer(undefined, { type: "init" }),
  entityManager: { entities: {}, selectedEntityId: null } as CustomEntityState<string, string>
};

const rootReducerSlice = createSlice({
  name: "root",
  initialState,
  reducers: {
    // Add common actions here if needed
  },
  extraReducers: (builder) => {
    builder.addCase(
      taskManagerSlice.actions.updateTaskTitle,
      (state, action: PayloadAction<string>) => {
        state.taskManager.taskTitle = action.payload;
      }
    );
    builder.addCase(
      taskManagerSlice.actions.updateTaskDescription,
      (state, action: PayloadAction<string>) => {
        state.taskManager.taskDescription = action.payload;
      }
    );
    builder.addCase(
      taskManagerSlice.actions.updateTaskStatus,
      (
        state,
        action: PayloadAction<"pending" | "inProgress" | "completed">
      ) => {
        state.taskManager.taskStatus = action.payload;
      }
    );
    builder.addCase(
      taskManagerSlice.actions.updateTaskDetails, // Replace with your specific action
      (
        state,
        action: PayloadAction<{ taskId: string; updatedDetails: Partial<Task> }>
      ) => {
        // Handle the action for updating task details
        const { taskId, updatedDetails } = action.payload;
        const taskToUpdate = state.taskManager.tasks.find(
          (task: WritableDraft<Task>) => task.id === taskId
        );

        if (taskToUpdate) {
          // Update the task details
          Object.assign(taskToUpdate, updatedDetails);
        }
      }
    );
    builder.addCase(taskManagerSlice.actions.addTask, (state) => {
      // Handle the action for adding a task
      const newTask: Task = {
        _id: "newTaskId2",
        id: randomTaskId, // generate unique id
        name: "", 
        title: "",
        description: "",
        assignedTo: {} as WritableDraft<User>,
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
        analysisType:AnalysisTypeEnum.TASK,
        analysisResults: [],
        data: {} as Data,
        source: "user",
        // Implementation of some method
        some(callbackfn: (value: Task, index: number, array: Task[]) => unknown, thisArg?: any): boolean {
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
          if (typeof this === 'object' && this !== null) {
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
              }
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
        ideas: []
      };
      state.taskManager.tasks.push(newTask as WritableDraft<Task>);
    });
    builder.addCase(taskManagerSlice.actions.addTask, (state) => {
      // Handle the action for adding a task
      const newTaskId = uuidv4();
      const newTask: Task = {
        _id: "newTaskId2",
        id: newTaskId,
        title: state.taskManager.taskTitle,
        description: state.taskManager.taskDescription,
        status: state.taskManager.taskStatus,
        then: function (arg0: (newTask: any) => void): unknown {
          arg0(newTask);
          return newTask;
          // You can add any further logic here if needed
        },
        assignedTo: {} as WritableDraft<User>,
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
        some(callbackfn: (value: Task, index: number, array: Task[]) => unknown, thisArg?: any): boolean {
          // Check if 'this' is an array
          if (Array.isArray(this)) {
            for (let i = 0; i < this.length; i++) {
              if (callbackfn(this[i], i, this)) {
                return true; // Return true if the callback returns true for any element
              }
            }
            return false; // Return false if the callback returns false for all elements
          } else {
            throw new Error("'some' method can only be used on arrays.");
          }
        },
        [Symbol.iterator](): IterableIterator<any> {
          // Check if 'this' is an object
          if (typeof this === 'object' && this !== null) {
            const taskKeys = Object.keys(this);
            let index = 0;
            return {
              next: () => {
                if (index < taskKeys.length) {
                  const key = taskKeys[index++];
                  return { value: this[key as keyof Task], done: false }; // Cast 'key' to keyof Task
                } else {
                  return { value: undefined, done: true };
                }
              },
              [Symbol.iterator]: function () {
                return this;
              }
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
        startDate: new Date,
        endDate: new Date,
        videoThumbnail: "",
        videoDuration: 0,
        videoUrl: "",
        ideas: []
      };
      state.taskManager.tasks.push(newTask as WritableDraft<Task>);
      state.taskManager.taskTitle = "";
      state.taskManager.taskDescription = "";
      state.taskManager.taskStatus = "pending";
      state.taskManager.priority = "medium";
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
      (state, action: PayloadAction<Video[]>) => {
      state.videoManager.videos = action.payload;
    });
    builder.addCase(
      useVideoManagerSlice.actions.setCurrentVideoId, (state, action: PayloadAction<string | null>) => {
      state.videoManager.currentVideoId = action.payload;
    });
    builder.addCase(
      useVideoManagerSlice.actions.updateVideoThumbnail, (state, action: PayloadAction<{ id: string, newThumbnail: string }>) => {
      const { id, newThumbnail } = action.payload;
      const videoIndex = state.videoManager.videos.findIndex(video => video.id === id);
      if (videoIndex !== -1) {
        state.videoManager.videos[videoIndex].thumbnailUrl = newThumbnail;
      }
    });
    builder.addCase(
      useVideoManagerSlice.actions.updateVideoTitle,
      (state, action: PayloadAction<{ id: string, newTitle: string }>) => {
      const { id, newTitle } = action.payload;
      const videoIndex = state.videoManager.videos.findIndex(video => video.id === id);
      if (videoIndex !== -1) {
        state.videoManager.videos[videoIndex].title = newTitle;
      }
    });
    builder.addCase(
      useVideoManagerSlice.actions.updateVideoDescription,
      (state, action: PayloadAction<{ id: string, newDescription: string }>) => {
      const { id, newDescription } = action.payload;
      const videoIndex = state.videoManager.videos.findIndex(video => video.id === id);
      if (videoIndex !== -1) {
        state.videoManager.videos[videoIndex].description = newDescription;
      }
    });
  }
});


// Combine reducers
const rootReducer = combineReducers({
  root: rootReducerSlice.reducer,
  dataManager: useDataManagerSlice.reducer,
  taskManager: taskManagerSlice.reducer,
  trackerManager: trackerManagerSlice.reducer,
  userManager: userManagerSlice.reducer,
  dataAnalyisManager: useDataAnalysisManagerSlice.reducer,
  useCalendarManager: useCalendarManagerSlice.reducer,
  todoManager: useTodoManagerSlice.reducer,
  calendarManager: useCalendarManagerSlice.reducer,
  videoManager: useVideoManagerSlice.reducer,
  useUserManager: userManagerSlice.reducer,
  useProjectManager: useProjectManagerSlice.reducer,
  dataAnalysisManager: useDataAnalysisManagerSlice.reducer,
  documentManager: useDocumentManagerSlice.reducer,
  userTodoManager: userManagerSlice.reducer,
  apiManager: useApiManagerSlice.reducer,
  randomWalkManager: useRandomWalkManagerSlice.reducer,
  pagingManager: usePagingManagerSlice.reducer,
  teamManager: useTeamManagerSlice.reducer,
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

export default  rootReducer;
export { initialState };

