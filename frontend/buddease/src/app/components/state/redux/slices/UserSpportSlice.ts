import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./RootSlice";

interface UserSupportFeedbackPreferencesState {
  feedbackEnabled: boolean;
  feedbackFrequency: "daily" | "weekly" | "monthly";
  // Add more preferences as needed
}

const initialState: UserSupportFeedbackPreferencesState = {
  feedbackEnabled: true, // Default to true
  feedbackFrequency: "weekly", // Default to weekly
  // Initialize more preferences here
};

export const userSupportFeedbackPreferencesSlice = createSlice({
  name: "userSupportFeedbackPreferences",
  initialState,
  reducers: {
    setFeedbackEnabled(state, action: PayloadAction<boolean>) {
      state.feedbackEnabled = action.payload;
    },
    setFeedbackFrequency(state, action: PayloadAction<"daily" | "weekly" | "monthly">) {
      state.feedbackFrequency = action.payload;
    },
    // Define more reducers for additional preferences here
  },
});

export const {
  setFeedbackEnabled,
  setFeedbackFrequency,
  // Add more action creators as needed
} = userSupportFeedbackPreferencesSlice.actions;

// Export the reducer
export default userSupportFeedbackPreferencesSlice.reducer;

// Selectors
export const selectFeedbackEnabled = (state: RootState) =>
  state.userSupportFeedbackPreferences.feedbackEnabled;
export const selectFeedbackFrequency = (state: RootState) =>
  state.userSupportFeedbackPreferences.feedbackFrequency;
// Add more selectors as needed
