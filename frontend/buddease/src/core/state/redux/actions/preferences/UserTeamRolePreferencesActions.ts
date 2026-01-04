UserTeamRolePreferencesActions.ts
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

interface UserTeamRolePreferencesState {
  preferredTeam: string;
  preferredRole: string;
}

const initialState: UserTeamRolePreferencesState = {
  preferredTeam: '',
  preferredRole: '',
};

const userTeamRolePreferencesSlice = createSlice({
  name: 'userTeamRolePreferences',
  initialState,
  reducers: {
    setPreferredTeam: (state, action: PayloadAction<string>) => {
      state.preferredTeam = action.payload;
    },
    setPreferredRole: (state, action: PayloadAction<string>) => {
      state.preferredRole = action.payload;
    },
  },
});

export const { setPreferredTeam, setPreferredRole } = userTeamRolePreferencesSlice.actions;

export default userTeamRolePreferencesSlice.reducer;
