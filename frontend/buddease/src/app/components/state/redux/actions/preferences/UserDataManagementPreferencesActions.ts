// UserDataManagementPreferencesActions.ts
import { createSlice } from '@reduxjs/toolkit';

interface UserDataManagementPreferencesState {
  backupEnabled: boolean;
  syncEnabled: boolean;
}

const initialState: UserDataManagementPreferencesState = {
  backupEnabled: false,
  syncEnabled: false,
};

const userDataManagementPreferencesSlice = createSlice({
  name: 'userDataManagementPreferences',
  initialState,
  reducers: {
    enableBackup: (state) => {
      state.backupEnabled = true;
    },
    enableSync: (state) => {
      state.syncEnabled = true;
    },
  },
});

export const { enableBackup, enableSync } = userDataManagementPreferencesSlice.actions;

export default userDataManagementPreferencesSlice.reducer;
