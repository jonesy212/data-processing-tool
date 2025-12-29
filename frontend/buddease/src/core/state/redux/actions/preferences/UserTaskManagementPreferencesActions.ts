// UserTaskManagementPreferencesActions.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
