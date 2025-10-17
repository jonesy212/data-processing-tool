// RootSlice.ts
import { Attachment } from "@/app/documents/attachment/Attachment";
import { FilteredEventsState } from '@/app/state/stores/FilterStore';
import { createAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer";

import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';


interface TaskManagerState<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  tasks: Task<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
}

interface RootState {
  taskManager: TaskManagerState;
  filterManager: FilteredEventsState;
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