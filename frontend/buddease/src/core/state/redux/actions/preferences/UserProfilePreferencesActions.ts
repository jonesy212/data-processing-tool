// UserProfilePreferencesActions.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfilePreferencesState {
  profilePicture: string;
  bio: string;
}

const initialState: UserProfilePreferencesState = {
  profilePicture: '',
  bio: '',
};

const userProfilePreferencesSlice = createSlice({
  name: 'userProfilePreferences',
  initialState,
  reducers: {
    setProfilePicture: (state, action: PayloadAction<string>) => {
      state.profilePicture = action.payload;
    },
    setBio: (state, action: PayloadAction<string>) => {
      state.bio = action.payload;
    },
  },
});

export const { setProfilePicture, setBio } = userProfilePreferencesSlice.actions;

export default userProfilePreferencesSlice.reducer;
