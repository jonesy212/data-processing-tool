// MeetingNotificationSlice.tsx
import { PayloadAction, createSlice } from '@reduxjs/toolkit';


// Define interface for meeting notification state
interface MeetingNotificationState {
  message: string;
  type: "success" | "error" | "warning" | "info" | null;
}

// Define initial state for meeting notifications
const initialMeetingNotificationState: MeetingNotificationState = {
  message: "",
  type: null,
};

// Create MeetingNotification slice
export const meetingNotificationSlice = createSlice({
  name: "meetingNotification",
  initialState: initialMeetingNotificationState,
  reducers: {
    // Action to set meeting notification message
    setMeetingNotificationMessage: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    // Action to clear meeting notification
    clearMeetingNotification: (state) => {
      state.message = "";
      state.type = null;
    },
    // Action to set meeting notification type
    setMeetingNotificationType: (state, action: PayloadAction<"success" | "error" | "warning" | "info">) => {
      state.type = action.payload;
    },
  },
});

// Export actions from MeetingNotification slice
export const { setMeetingNotificationMessage, clearMeetingNotification, setMeetingNotificationType } = meetingNotificationSlice.actions;

// Export the reducer for the MeetingNotification slice
export const meetingNotificationReducer = meetingNotificationSlice.reducer;

export type {MeetingNotificationState}