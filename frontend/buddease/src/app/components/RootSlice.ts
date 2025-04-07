// RootSlice.ts

import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
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

const updateTaskTitle = createAction<{ id: string; title: string }>(
  "useTaskManagerSlice/updateTaskTitle"
);

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
    builder.addCase(updateTaskTitle, (state, action) => {
      const taskToUpdate = state.tasks.find(
        (task: WritableDraft<Task>) => task.id === action.payload.id
      );
      if (taskToUpdate) {
        taskToUpdate.title = action.payload.title;
      }
    });
  },
});

// Export the action creator
export { updateTaskTitle };

  export type { RootState };
export default taskManagerSlice.reducer;
