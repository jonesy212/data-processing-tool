// UserSupportFeedbackPreferencesActions.ts
import { createSlice } from '@reduxjs/toolkit';

interface UserSupportFeedbackPreferencesState {
  feedbackEnabled: boolean;
  supportTicketsEnabled: boolean;
}

const initialState: UserSupportFeedbackPreferencesState = {
  feedbackEnabled: true,
  supportTicketsEnabled: true,
};

const userSupportFeedbackPreferencesSlice = createSlice({
  name: 'userSupportFeedbackPreferences',
  initialState,
  reducers: {
    enableFeedback: (state) => {
      state.feedbackEnabled = true;
    },
    enableSupportTickets: (state) => {
      state.supportTicketsEnabled = true;
    },
  },
});

export const { enableFeedback, enableSupportTickets } = userSupportFeedbackPreferencesSlice.actions;

export default userSupportFeedbackPreferencesSlice.reducer;
