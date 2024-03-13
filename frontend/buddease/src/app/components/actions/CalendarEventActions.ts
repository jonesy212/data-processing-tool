// calendar/CalendarActions.ts

import { createAction } from '@reduxjs/toolkit';
import { CalendarEvent } from '../state/stores/CalendarEvent';

// Calendar actions
export const CalendarActions = {
  addEvent: createAction<CalendarEvent>('calendar/addEvent'),
  removeEvent: createAction<string>('calendar/removeEvent'), // Assuming eventId is a string
  fetchCalendarEventsRequest: createAction('calendar/fetchCalendarEventsRequest'),
  fetchCalendarEventsSuccess: createAction<{ events: CalendarEvent[] }>('calendar/fetchCalendarEventsSuccess'),
  fetchCalendarEventsFailure: createAction<{ error: string }>('calendar/fetchCalendarEventsFailure'),

  // Additional actions for communication
  startAudioCall: createAction('communication/startAudioCall'),
  startVideoCall: createAction('communication/startVideoCall'),
  sendTextMessage: createAction<string>('communication/sendTextMessage'),
  startCollaboration: createAction('communication/startCollaboration'),

  // Actions for project management phases
  startPhase: createAction<string>('phases/startPhase'),
  endPhase: createAction<string>('phases/endPhase'),

  // Actions for data analysis
  fetchDataAnalysis: createAction('dataAnalysis/fetchDataAnalysis'),

  // Actions for community involvement
  joinCommunity: createAction('community/joinCommunity'),
  leaveCommunity: createAction('community/leaveCommunity'),

  // Actions for monetization opportunities
  offerDevelopmentService: createAction('monetization/offerDevelopmentService'),
  requestCustomAppProject: createAction('monetization/requestCustomAppProject'),
};
