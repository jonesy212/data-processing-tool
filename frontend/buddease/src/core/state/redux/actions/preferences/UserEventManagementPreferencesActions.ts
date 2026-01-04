UserEventManagementPreferencesActions.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface UserEventManagementPreferencesState {
  remindersEnabled: boolean;
  defaultReminderTime: string;
}

const initialState: UserEventManagementPreferencesState = {
  remindersEnabled: true,
  defaultReminderTime: '15 minutes',
};

const userEventManagementPreferencesSlice = createSlice({
  name: 'userEventManagementPreferences',
  initialState,
  reducers: {
    enableReminders: (state) => {
      state.remindersEnabled = true;
    },
    setDefaultReminderTime: (state, action: PayloadAction<string>) => {
      state.defaultReminderTime = action.payload;
    },
  },
});

export const { enableReminders, setDefaultReminderTime } = userEventManagementPreferencesSlice.actions;

export default userEventManagementPreferencesSlice.reducer;
