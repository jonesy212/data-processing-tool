// TaskSlice.ts
import { generateNewTask } from '@/app/generators/GenerateNewTask';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../../models/tasks/Task';

interface TaskManagerState {
  tasks: Task[];
  taskTitle: string;
  taskDescription: string;
  taskStatus: 'pending' | 'inProgress' | 'completed';
}

const initialState: TaskManagerState = {
  tasks: [],
  taskTitle: '',
  taskDescription: '',
  taskStatus: 'pending',
};

export const taskManagerSlice = createSlice({
  name: "taskManager",
  initialState,
  reducers: {
    updateTaskTitle: (state, action: PayloadAction<string>) => {
      state.taskTitle = action.payload;
    },

    updateTaskDescription: (state, action: PayloadAction<string>) => {
      state.taskDescription = action.payload;
    },

    updateTaskStatus: (
      state,
      action: PayloadAction<"pending" | "inProgress" | "completed">
    ) => {
      state.taskStatus = action.payload;
    },


    updateTaskDetails: (
      state,
      action: PayloadAction<{ taskId: string; updatedDetails: Partial<Task> }>
    ) => {
      const { taskId, updatedDetails } = action.payload;
      const taskToUpdate = state.tasks.find((task) => task.id === taskId);

      if (taskToUpdate) {
        // Update the task details
        Object.assign(taskToUpdate, updatedDetails);
      }
    },

    addTask: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const { id, title } = action.payload;
      if (state.taskTitle.trim() === "") {
        console.error("Task title cannot be empty.");
        return;
      }

      generateNewTask().then((newTask: any) => {
        state.tasks.push(newTask);
      });

      state.taskTitle = "";
      state.taskDescription = "";
      state.taskStatus = "pending";
    },

    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((task) => task.id !== action.payload);
    },


    
  },
  
});



// Export actions

export const {
  updateTaskTitle,
  updateTaskDescription,
  updateTaskStatus,
  addTask,
  removeTask,
} = taskManagerSlice.actions;


// Export selector for accessing the tasks from the state
export const selectTasks = (state: { tasks: TaskManagerState }) => state.tasks.tasks;

// Export reducer for the tracker entity slice
export default taskManagerSlice.reducer;
