// MeetingActions.ts

import { createAction } from "@reduxjs/toolkit";

export const MeetingActions = {
  performMeetingActions: createAction<string | null>(
    "meeting/performMeetingActions"
  ),
  joinMeeting: createAction<string>("meeting/joinMeeting"),
  leaveMeeting: createAction<string>("meeting/leaveMeeting"),
  updateMeeting: createAction<{ meetingId: string; updates: Object }>(
    "meeting/updateMeeting"
  ),
};
