// UserCollaborationPreferencesActions.ts
import { createSlice } from '@reduxjs/toolkit';

interface UserCollaborationPreferencesState {
  chatEnabled: boolean;
  fileSharingEnabled: boolean;
}

const initialState: UserCollaborationPreferencesState = {
  chatEnabled: true,
  fileSharingEnabled: true,
};

const userCollaborationPreferencesSlice = createSlice({
  name: 'userCollaborationPreferences',
  initialState,
  reducers: {
    enableChat: (state) => {
      state.chatEnabled = true;
    },
    enableFileSharing: (state) => {
      state.fileSharingEnabled = true;
    },
  },
});

export const { enableChat, enableFileSharing } = userCollaborationPreferencesSlice.actions;

export default userCollaborationPreferencesSlice.reducer;
