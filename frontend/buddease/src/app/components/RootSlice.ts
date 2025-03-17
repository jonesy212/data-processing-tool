// RootSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";

interface Task {
  id: string;
  title: string;
  // Add more fields as needed
}

interface TaskManagerState {
  tasks: Task[];
}

interface RootState {
  taskManager: TaskManagerState;
}

const initialState: TaskManagerState = {
  tasks: [],
};

const taskManagerSlice = createSlice({
  name: "taskManager",
  initialState,
  reducers: {
    updateTaskTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const taskToUpdate = state.tasks.find(
        (task: WritableDraft<Task>) => task.id === action.payload.id
      );
      if (taskToUpdate) {
        taskToUpdate.title = action.payload.title;
      }
    },
    // Add more reducers as needed
  },
  extraReducers: (builder) => {
    builder.addCase(
      "useTaskManagerSlice/updateTaskTitle",
      (state, action: PayloadAction<{ id: string; title: string }>) => {
        const taskToUpdate = state.tasks.find(
          (task: WritableDraft<Task>) => task.id === action.payload.id
        );
        if (taskToUpdate) {
          taskToUpdate.title = action.payload.title;
        }
      }
    );
  },
});

export const { updateTaskTitle } = taskManagerSlice.actions;

export default taskManagerSlice.reducer;
