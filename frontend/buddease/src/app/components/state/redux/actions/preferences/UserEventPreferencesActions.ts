// UserEventPreferencesActions.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserEventPreferencesState {
  preferredEventTypes: string[];
  preferredEventLocations: string[];
}

const initialState: UserEventPreferencesState = {
  preferredEventTypes: [],
  preferredEventLocations: [],
};

const userEventPreferencesSlice = createSlice({
  name: 'userEventPreferences',
  initialState,
  reducers: {
    setPreferredEventTypes: (state, action: PayloadAction<string[]>) => {
      state.preferredEventTypes = action.payload;
    },
    setPreferredEventLocations: (state, action: PayloadAction<string[]>) => {
      state.preferredEventLocations = action.payload;
    },
  },
});

export const { setPreferredEventTypes, setPreferredEventLocations } = userEventPreferencesSlice.actions;

export default userEventPreferencesSlice.reducer;
