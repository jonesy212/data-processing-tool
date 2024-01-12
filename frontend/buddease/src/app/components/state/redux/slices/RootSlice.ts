// rootSlice.ts
import { combineReducers, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../../models/tasks/Task';
import { Tracker } from '../../../models/tracker/Tracker';
import { userManagerSlice } from '../../../users/UserSlice';
import { WritableDraft } from '../ReducerGenerator';
import { useDataAnalysisManagerSlice } from './DataAnalysisSlice';
import { taskManagerSlice } from './TaskSlice';
import { trackerManagerSlice } from './TrackerSlice';
// Import uuid
import { useCalendarManagerSlice } from '@/app/components/calendar/CalendarSlice';
import { v4 as uuidv4 } from "uuid";
import { DocumentOptions } from '../../../documents/DocumentOptions';


const randomTaskId = uuidv4().toString();

export interface RootState {
  taskManager: ReturnType<typeof taskManagerSlice.reducer>;
  trackerManager: ReturnType<typeof trackerManagerSlice.reducer>
  userManager: ReturnType<typeof userManagerSlice.reducer>
  dataAnalysisManager: ReturnType<typeof useDataAnalysisManagerSlice.reducer>
  calendarManager: ReturnType<typeof useCalendarManagerSlice.reducer>
  document: {
    documentType: DocumentOptions['documentType'],
    userIdea: DocumentOptions['userIdea'];
  }
 }


const initialState: RootState = {
  taskManager: taskManagerSlice.reducer(undefined, { type: "init" }),
  trackerManager: trackerManagerSlice.reducer(undefined, { type: "init" }),
  userManager: userManagerSlice.reducer(undefined, { type: "init" }),
  dataAnalysisManager: useDataAnalysisManagerSlice.reducer(undefined, { type: "init" }),
  calendarManager: useCalendarManagerSlice.reducer(undefined, { type: "init" }),
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
    builder.addCase(
      taskManagerSlice.actions.updateTaskDetails, // Replace with your specific action
      (state, action: PayloadAction<{ taskId: string, updatedDetails: Partial<Task> }>) => {
        // Handle the action for updating task details
        const { taskId, updatedDetails } = action.payload;
        const taskToUpdate = state.taskManager.tasks.find((task) => task.id === taskId);

        if (taskToUpdate) {
          // Update the task details
          Object.assign(taskToUpdate, updatedDetails);
        }
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
        status: "pending",
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
  userManager: userManagerSlice.reducer,
  dataAnalyisManager: useDataAnalysisManagerSlice.reducer,
  useCalendarManager: useCalendarManagerSlice.reducer,
  
  // Add other slices as needed
});

// Export selectors for accessing state from slices
export const selectTaskManager = (state: RootState) => state.taskManager;
export const selectTrackers = (state: RootState) => state.trackerManager;
export const selectCalendarManager = (state: RootState) => state.calendarManager;
export const selectDataAnalysisManager = (state: RootState) => state.dataAnalysisManager;
// Add other selectors as needed

export default rootReducer;
