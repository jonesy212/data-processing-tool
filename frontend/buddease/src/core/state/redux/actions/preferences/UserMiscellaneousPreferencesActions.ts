// UserMiscellaneousPreferencesActions.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserMiscellaneousPreferencesState {
  preferredLanguage: string;
  receiveNotifications: boolean;
}

const initialState: UserMiscellaneousPreferencesState = {
  preferredLanguage: '',
  receiveNotifications: false,
};

const userMiscellaneousPreferencesSlice = createSlice({
  name: 'userMiscellaneousPreferences',
  initialState,
  reducers: {
    setPreferredLanguage: (state, action: PayloadAction<string>) => {
      state.preferredLanguage = action.payload;
    },
    setReceiveNotifications: (state, action: PayloadAction<boolean>) => {
      state.receiveNotifications = action.payload;
    },
  },
});

export const { setPreferredLanguage, setReceiveNotifications } = userMiscellaneousPreferencesSlice.actions;

export default userMiscellaneousPreferencesSlice.reducer;
