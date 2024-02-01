// rootSlice.ts
import { combineReducers, createSlice, PayloadAction } from "@reduxjs/toolkit";
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
import { v4 as uuidv4 } from "uuid";
import { useApiManagerSlice } from "./ApiSlice";
import { useDataManagerSlice } from "./DataSlice";
import { useDocumentManagerSlice } from "./DocumentSlice";

const randomTaskId = uuidv4().toString();

export interface RootState {
  userTodoManager: ReturnType<typeof userManagerSlice.reducer>;
  todoManager: ReturnType<typeof useTodoManagerSlice.reducer>;
  taskManager: ReturnType<typeof taskManagerSlice.reducer>;
  trackerManager: ReturnType<typeof trackerManagerSlice.reducer>;
  userManager: ReturnType<typeof userManagerSlice.reducer>;
  dataAnalysisManager: ReturnType<typeof useDataAnalysisManagerSlice.reducer>;
  dataManager: ReturnType<typeof useDataManagerSlice.reducer>;
  calendarManager: ReturnType<typeof useCalendarManagerSlice.reducer>;
  documentManager: ReturnType<typeof useDocumentManagerSlice.reducer>
  apiManager: ReturnType<typeof useApiManagerSlice.reducer>
}

const initialState: RootState = {
  dataManager: useDataManagerSlice.reducer(undefined, { type: "inid" }),
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
          (task) => task.id === taskId
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
        title: "",
        description: "",
        assignedTo: [],
        dueDate: new Date(), // Changed to Date object
        status: "pending",
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
        analysisType: "",
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
                  return { value: this[key] , done: false };
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
        videoData: {} as VideoData
      };
      state.taskManager.tasks.push(newTask);
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
        assignedTo: [],
        dueDate: new Date(),
        priority: "medium",
        isActive: false,
        tags: [],
        previouslyAssignedTo: [],
        done: false,
        analysisType: "",
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
        [Symbol.iterator]: function (): Iterator<any, any, undefined> {
          throw new Error("Function not implemented.");
        },
        phase: null,
        videoData: {} as Record<string, VideoData>
      };
      state.taskManager.tasks.push(newTask);
      state.taskManager.taskTitle = "";
      state.taskManager.taskDescription = "";
      state.taskManager.taskStatus = "pending";
    });

    // Add other slices as needed
    builder.addCase(
      trackerManagerSlice.actions.addTracker,
      (state, action: PayloadAction<Tracker>) => {
        // Handle the action for trackerSlice
        state.trackerManager.trackers.push(action.payload);
      }
    );
  },
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
