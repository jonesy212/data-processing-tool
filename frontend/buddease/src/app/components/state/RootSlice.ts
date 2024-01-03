// rootSlice.ts
import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../models/tasks/Task';
import { Tracker } from '../models/tracker/Tracker';
import { WritableDraft } from './redux/ReducerGenerator';
import { taskManagerSlice } from './redux/slices/TaskSlice';
import { trackerManagerSlice } from './redux/slices/TrackerSlice';
// Import uuid
import { v4 as uuidv4 } from "uuid";
import { DocumentOptions } from '../documents/DocumentOptions';


const randomTaskId = uuidv4().toString();

export interface RootState {
  taskManager: ReturnType<typeof taskManagerSlice.reducer>;
  trackerManager: ReturnType<typeof trackerManagerSlice.reducer>
  document: {
    documentType: DocumentOptions['documentType'],
    userIdea: DocumentOptions['userIdea'];
  }
 }


const initialState: RootState = {
  taskManager: taskManagerSlice.reducer(undefined, { type: "init" }),
  trackerManager: trackerManagerSlice.reducer(undefined, { type: "init" }),
  document: {
    documentType: "",
    userIdea: "",
  }
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
      (state, action: PayloadAction<"pending" | "inProgress" | "completed">) => {
        state.taskManager.taskStatus = action.payload;
      }
    );
    builder.addCase(taskManagerSlice.actions.addTask, (state) => {
      // Handle the action for adding a task
      const newTask: WritableDraft<Task> = {
        id: randomTaskId, // generate unique id
        title: "",
        description: "",
        assignedTo: [],
        dueDate: new Date(), // Changed to Date object
        status: "todo",
        priority: 'medium',
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
            onFulfill(newTask);
          }, 1000);
          return this; // Return the current object for chaining if needed
        },
        previouslyAssignedTo: [],
        done: false
      };
      state.taskManager.tasks.push(newTask);
    });
    builder.addCase(
      taskManagerSlice.actions.addTask, (state) => {
        // Handle the action for adding a task
        const newTaskId = uuidv4();
        const newTask: Task = {
          id: newTaskId,
          title: state.taskManager.taskTitle,
          description: state.taskManager.taskDescription,
          status: state.taskManager.taskStatus,
          then: function (arg0: (newTask: any) => void): unknown {
            arg0(newTask);

            throw new Error('Function not implemented.');
          },
          assignedTo: [],
          dueDate: new Date,
          priority: 'medium',
          isActive: false,
          tags: [],
          previouslyAssignedTo: [],
          done: false
        };
        state.taskManager.tasks.push(newTask);
        state.taskManager.taskTitle = '';
        state.taskManager.taskDescription = '';
        state.taskManager.taskStatus = 'pending';
      }
    );

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
  taskManager: taskManagerSlice.reducer,
  trackerManager: trackerManagerSlice.reducer,
  // Add other slices as needed
});

// Export selectors for accessing state from slices
export const selectTaskManager = (state: RootState) => state.taskManager;
export const selectTrackers = (state: RootState) => state.trackerManager;
// Add other selectors as needed

export default rootReducer;
