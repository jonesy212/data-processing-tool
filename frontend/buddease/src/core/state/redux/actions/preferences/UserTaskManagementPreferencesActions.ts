UserTaskManagementPreferencesActions.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface UserTaskManagementPreferencesState {
  notificationsEnabled: boolean;
  priorityFilter: string;
}

const initialState: UserTaskManagementPreferencesState = {
  notificationsEnabled: true,
  priorityFilter: 'high',
};

const userTaskManagementPreferencesSlice = createSlice({
  name: 'userTaskManagementPreferences',
  initialState,
  reducers: {
    enableNotifications: (state) => {
      state.notificationsEnabled = true;
    },
    setPriorityFilter: (state, action: PayloadAction<string>) => {
      state.priorityFilter = action.payload;
    },
  },
});

export const { enableNotifications, setPriorityFilter } = userTaskManagementPreferencesSlice.actions;

export default userTaskManagementPreferencesSlice.reducer;
