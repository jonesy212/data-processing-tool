// UserSupportFeedbackPreferencesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './RootSlice';

interface UserSupportFeedbackPreferencesState {
  receiveFeedbackEmails: boolean;
  receiveSurveyNotifications: boolean;
}

const initialState: UserSupportFeedbackPreferencesState = {
  receiveFeedbackEmails: true, // Default to true
  receiveSurveyNotifications: true, // Default to true
};

export const userSupportFeedbackPreferencesSlice = createSlice({
  name: 'userSupportFeedbackPreferences',
  initialState,
  reducers: {
    // Action to toggle receiving feedback emails
    toggleReceiveFeedbackEmails: (state) => {
      state.receiveFeedbackEmails = !state.receiveFeedbackEmails;
    },
    // Action to toggle receiving survey notifications
    toggleReceiveSurveyNotifications: (state) => {
      state.receiveSurveyNotifications = !state.receiveSurveyNotifications;
    },
    // Action to set receiving feedback emails
    setReceiveFeedbackEmails: (state, action: PayloadAction<boolean>) => {
      state.receiveFeedbackEmails = action.payload;
    },
    // Action to set receiving survey notifications
    setReceiveSurveyNotifications: (state, action: PayloadAction<boolean>) => {
      state.receiveSurveyNotifications = action.payload;
    },
  },
});

// Export action creators
export const {
  toggleReceiveFeedbackEmails,
  toggleReceiveSurveyNotifications,
  setReceiveFeedbackEmails,
  setReceiveSurveyNotifications,
} = userSupportFeedbackPreferencesSlice.actions;

// Selectors to access user support feedback preferences state
export const selectUserSupportFeedbackPreferences = (state: RootState) =>
  state.userManager.userSupportFeedbackPreferences;

export default userSupportFeedbackPreferencesSlice.reducer;
