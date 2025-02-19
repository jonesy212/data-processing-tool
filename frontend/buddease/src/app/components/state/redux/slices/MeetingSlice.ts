// MeetingSlice.ts
import { Meeting } from "@/app/components/communications/scheduler/Meeting";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MeetingNotificationState } from "./MeetingNotificationSlice";
import { WritableDraft } from "../ReducerGenerator";
import { User } from "@/app/components/users/User";

// Define interface for meeting-related state
interface MeetingState {
  meetings: Meeting[];
  selectedMeeting: Meeting | null;
  meetingError: string | null;
    isMeetingLoading: boolean;
    rescheduleMeetingNotification: {
      message: string;
      type: "error" | "success" | "warning" | "info" | null
    }
  // Define other meeting-related state properties here
}

// Define initial state for meetings
const initialMeetingState: MeetingState = {
  meetings: [],
  selectedMeeting: null,
  meetingError: null,
    isMeetingLoading: false,
  rescheduleMeetingNotification: {
      message: "",
      type: null
    }
  // Initialize other meeting-related state properties here
};

// Create Meeting slice
export const meetingSlice = createSlice({
  name: "meeting",
  initialState: initialMeetingState,
  reducers: {
    // Define reducers for meeting actions here
    setMeetings: (state, action: PayloadAction<WritableDraft<Meeting>[]>) => {
      state.meetings = action.payload;
      const { payload } = action;
      return {
        ...state,
        meetings: payload,
      };
    },
    addMeeting: (state, action: PayloadAction<Meeting>) => {
      state.meetings.push(action.payload);
      const meeting = action.payload;
      return {
        ...state,
        meetings: [...state.meetings, meeting],
        selectedMeeting: meeting,
      };
    },
    selectMeeting: (state, action: PayloadAction<WritableDraft<Meeting>>) => {
      state.selectedMeeting = action.payload;
      const selectedMeeting = action.payload;
      return {
        ...state,
        selectedMeeting,
      };
    },
    setMeetingError: (state, action: PayloadAction<string | null>) => {
      state.meetingError = action.payload;
      const error = action.payload;
      return {
        ...state,
        meetingError: error,
      };
      },
    setIsMeetingLoading: (state, action: PayloadAction<boolean>) => {
        state.isMeetingLoading = action.payload;
        const isLoading = action.payload;
        return {
          ...state,
          isMeetingLoading: isLoading
        };
      },
      updateMeeting: (
        state, action: PayloadAction<WritableDraft<User> | null | undefined>) => {
        const {id, ...meetingData} = action.payload;
        state.meetings = state.meetings.map(meeting => {
          if(meeting.id === id) {
            return {...meeting, ...meetingData};
          }
          return meeting;
        });
      },
      deleteMeeting: (state, action: PayloadAction<string>) => {
      state.meetings = state.meetings.filter(
          (meeting) => meeting.id !== Number(action.payload)
          );
      },
      rescheduleMeetingNotification: (
          state, action: PayloadAction<MeetingNotificationState>) => {
          state.rescheduleMeetingNotification = action.payload;
          const notification = action.payload;
          return {
            ...state,
            rescheduleMeetingNotification: notification
          }
      }, 
      resetMeetingState: (state) => {
        Object.assign(state, initialMeetingState);
      },
  },
});
