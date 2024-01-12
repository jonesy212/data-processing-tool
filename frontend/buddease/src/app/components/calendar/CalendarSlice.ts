import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CalendarEvent } from '../state/stores/CalendarStore';
import { Notification } from '../support/NofiticationsSlice';

interface Milestone {
  id: string;
  title: string;
  date: Date;
}

interface CalendarEntitySliceState {
  entities: Record<string, CalendarEvent>;
  milestones: Record<string, Milestone>;
  notifications: Record<string, Notification>;
}

export const useCalendarManagerSlice = createSlice({
  name: 'calendarEvents',
  initialState: { entities: {}, milestones: {}, notifications: {} } as CalendarEntitySliceState,
  reducers: {
    addCalendarEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.entities[action.payload.id] = action.payload;
    },
    removeCalendarEvent: (state, action: PayloadAction<string>) => {
      delete state.entities[action.payload];
    },
    updateCalendarEventTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string }>
    ) => {
      const event = state.entities[action.payload.id];
      if (event) {
        event.title = action.payload.newTitle;
      }
    },
    addMilestone: (state, action: PayloadAction<Milestone>) => {
      state.milestones[action.payload.id] = action.payload;
    },
    removeMilestone: (state, action: PayloadAction<string>) => {
      delete state.milestones[action.payload];
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications[action.payload.id] = action.payload;
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      delete state.notifications[action.payload];
    },
    // Add other actions as needed
  },
});

export const {
  addCalendarEvent,
  removeCalendarEvent,
  updateCalendarEventTitle,
  addMilestone,
  removeMilestone,
  addNotification,
  removeNotification,
} = useCalendarManagerSlice.actions;

export const selectCalendarEvents = (state: {
  calendarEvents: CalendarEntitySliceState;
}) => state.calendarEvents.entities;

export const selectMilestones = (state: {
  calendarEvents: CalendarEntitySliceState;
}) => state.calendarEvents.milestones;

export const selectNotifications = (state: {
  calendarEvents: CalendarEntitySliceState;
}) => state.calendarEvents.notifications;

export default useCalendarManagerSlice.reducer;
