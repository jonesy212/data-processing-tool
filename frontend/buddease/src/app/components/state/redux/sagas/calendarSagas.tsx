// calendar/CalendarSagas.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import { CalendarActions } from "@/app/components/calendar/CalendarActions";
import { CommunicationActions } from '@/app/components/community/CommunicationActions';
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { AxiosResponse } from "axios";
import { Effect, call, put, select, takeLatest } from "redux-saga/effects";
import { CalendarEvent } from "../../stores/CalendarEvent";

  // Replace 'yourApiEndpoint' with the actual API endpoint
  const API_BASE_URL = endpoints.calendar.events


  // Replace 'yourApiEndpoint' with the actual API endpoint
  const fetchCalendarEventsAPI = () => axiosInstance.get(API_BASE_URL);

function* addCalendarEventSaga(
  action: ReturnType<typeof CalendarActions.addEvent>
): Generator<Effect, void, any> {
  try {
    const { payload: newEvent } = action;

    // Assuming there's an API endpoint to add a calendar event
    const response: AxiosResponse<CalendarEvent> = yield call(() =>
      axiosInstance.post("/api/calendar-events", newEvent, {
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    yield put(CalendarActions.fetchCalendarEventsSuccess({ events: [response.data] }));
  } catch (error) {
    yield put(
      CalendarActions.fetchCalendarEventsFailure({
        error: NOTIFICATION_MESSAGES.CalendarEvents.ADD_EVENT_ERROR,
      })
    );
  }
}

function* fetchCalendarEventsSaga(): Generator<Effect, void, any> {
  try {
    yield put(CalendarActions.fetchCalendarEventsRequest());
    const response: AxiosResponse<CalendarEvent[]> = yield call(fetchCalendarEventsAPI);
    yield put(CalendarActions.fetchCalendarEventsSuccess({ events: response.data }));
  } catch (error) {
    yield put(
      CalendarActions.fetchCalendarEventsFailure({
        error: NOTIFICATION_MESSAGES.CalendarEvents.FETCH_EVENTS_ERROR,
      })
    );
  }
}


function* updateCalendarEventSaga(action: ReturnType<typeof CalendarActions.updateCalendarEventRequest>): Generator<Effect, void, any> {
  const { id, newEvent } = action.payload;
  const { title, startDate, endDate, description } = newEvent;
  
  try {
    yield call(() => axiosInstance.put(`/api/calendar-events/${id}`, { title, startDate, endDate, description }));
    yield put(CalendarActions.updateCalendarEventSuccess({ event: newEvent }));
  } catch (error) {
    yield put(
      CalendarActions.updateCalendarEventFailure({
        error: NOTIFICATION_MESSAGES.CalendarEvents.UPDATE_EVENT_ERROR,
      })
    );
  }
}

function* removeCalendarEventSaga(
  action: ReturnType<typeof CalendarActions.removeEvent>
): Generator<Effect, void, any> {
  try {
    const { payload: eventId } = action;

    yield call(() => axiosInstance.delete(`/api/calendar-events/${eventId}`));

    yield put(
      CalendarActions.fetchCalendarEventsSuccess({
        events: yield select((state) =>
          state.calendarEvents.filter((event: CalendarEvent) => event.id !== eventId)
        ),
      })
    );
  } catch (error) {
    yield put(
      CalendarActions.fetchCalendarEventsFailure({
        error: NOTIFICATION_MESSAGES.CalendarEvents.REMOVE_EVENT_ERROR,
      })
    );
  }
}


function* shareCalendarSaga(event: ReturnType<typeof CalendarActions.shareEvent>): Generator<Effect, void, any> { 
  const { payload: eventId } = event;
  try {
    yield call(() => axiosInstance.post(`/api/calendar-events/${eventId}/share`));
    yield put(CalendarActions.shareEventSuccess({ eventId: "view" }));
  } catch (error) {
    yield put(
      CalendarActions.shareEventFailure({
        error: NOTIFICATION_MESSAGES.CalendarEvents.SHARE_EVENT_ERROR,
      })
    );
  }
}


function* syncCalendarSaga(event: ReturnType<typeof CalendarActions.syncEvent>): Generator<Effect, void, any> { 
  const { payload: eventId } = event;
  try {
    yield call(() => axiosInstance.post(`/api/calendar-events/${eventId}/sync`));
    yield put(CalendarActions.syncEventSuccess({ eventId: "view" }));
  } catch (error) {
    yield put(
      CalendarActions.syncEventFailure({
        error: NOTIFICATION_MESSAGES.CalendarEvents.SYNC_EVENT_ERROR,
      })
    );
  }
}












// Additional Sagas for Communication and Collaboration
function* startCommunicationSaga(
  action: ReturnType<typeof CommunicationActions.startCommunication>
): Generator<Effect, void, any> {
  try {
    // Logic to initiate communication (audio, video, text)
    // ...
  } catch (error) {
    // Handle communication initiation failure
    console.error('Communication initiation error:', error);
  }
}

function* collaborationSaga(
  action: ReturnType<typeof CommunicationActions.collaborate>
): Generator<Effect, void, any> {
  try {
    // Logic for real-time collaboration
    // ...
  } catch (error) {
    // Handle collaboration failure
    console.error('Collaboration error:', error);
  }
}

// Add other sagas as needed (update, complete, etc.)

export function* watchCalendarEventUpdateSagas() {


// Standard Calendar Actions
yield takeLatest(CalendarActions.addEvent.type, addCalendarEventSaga);
yield takeLatest(CalendarActions.removeEvent.type, removeCalendarEventSaga);
yield takeLatest(CalendarActions.fetchCalendarEventsRequest.type, fetchCalendarEventsSaga);

// Async Event Actions
yield takeLatest(CalendarActions.updateCalendarEventRequest.type, updateCalendarEventSaga);
yield takeLatest(CalendarActions.removeCalendarEventRequest.type, removeCalendarEventSaga);

// Sharing and Syncing Actions
yield takeLatest(CalendarActions.shareCalendar.type, shareCalendarSaga);
yield takeLatest(CalendarActions.syncCalendar.type, syncCalendarSaga);
yield takeLatest(CalendarActions.exportCalendar.type, exportCalendarSaga);
yield takeLatest(CalendarActions.importCalendar.type, importCalendarSaga);

// Event Manipulation and History Actions
yield takeLatest(CalendarActions.createRecurringEvent.type, createRecurringEventSaga);
yield takeLatest(CalendarActions.dragAndDropEvent.type, dragAndDropEventSaga);
yield takeLatest(CalendarActions.createEventTemplate.type, createEventTemplateSaga);
yield takeLatest(CalendarActions.revertEventChanges.type, revertEventChangesSaga);
yield takeLatest(CalendarActions.setTimeZone.type, setTimeZoneSaga);
yield takeLatest(CalendarActions.resolveEventConflict.type, resolveEventConflictSaga);
yield takeLatest(CalendarActions.duplicateEvent.type, duplicateEventSaga);
yield takeLatest(CalendarActions.viewEventHistory.type, viewEventHistorySaga);

// Event Feedback and Communication Actions
yield takeLatest(CalendarActions.provideEventFeedback.type, provideEventFeedbackSaga);
yield takeLatest(CalendarActions.scheduleMeeting.type, scheduleMeetingSaga);
yield takeLatest(CalendarActions.addEventComment.type, addEventCommentSaga);
yield takeLatest(CalendarActions.sendEventCollaborationInvitation.type, sendEventCollaborationInvitationSaga);

// Event Search and Organization Actions
yield takeLatest(CalendarActions.searchEvents.type, searchEventsSaga);
yield takeLatest(CalendarActions.eventCategoriesTags.type, eventCategoriesTagsSaga);
yield takeLatest(CalendarActions.eventPrivacy.type, eventPrivacySaga);
yield takeLatest(CalendarActions.eventAttachments.type, eventAttachmentsSaga);

// Event Management and Customization Actions
yield takeLatest(CalendarActions.setEventReminder.type, setEventReminderSaga);
yield takeLatest(CalendarActions.setEventColor.type, setEventColorSaga);
yield takeLatest(CalendarActions.setEventPermissions.type, setEventPermissionsSaga);
yield takeLatest(CalendarActions.setEventPriority.type, setEventPrioritySaga);
yield takeLatest(CalendarActions.editRecurringEventInstance.type, editRecurringEventInstanceSaga);
yield takeLatest(CalendarActions.setEventLabels.type, setEventLabelsSaga);
yield takeLatest(CalendarActions.customizeEventView.type, customizeEventViewSaga);

// Event Tagging and Labeling Actions
yield takeLatest(CalendarActions.createEventCategory.type, createEventCategorySaga);
yield takeLatest(CalendarActions.assignEventCategory.type, assignEventCategorySaga);
yield takeLatest(CalendarActions.createEventLabel.type, createEventLabelSaga);
yield takeLatest(CalendarActions.assignEventLabel.type, assignEventLabelSaga);
yield takeLatest(CalendarActions.createEventTag.type, createEventTagSaga);
yield takeLatest(CalendarActions.assignEventTag.type, assignEventTagSaga);

// Miscellaneous Event Actions
yield takeLatest(CalendarActions.respondToEventRSVP.type, respondToEventRSVPSaga);
yield takeLatest(CalendarActions.shareEventExternally.type, shareEventExternallySaga);
yield takeLatest(CalendarActions.suggestEventLocation.type, suggestEventLocationSaga);

// Communication sagas
yield takeLatest(CommunicationActions.startCommunication.type, startCommunicationSaga);
yield takeLatest(CommunicationActions.collaborate.type, collaborationSaga);


  // Communication sagas
  yield takeLatest(CommunicationActions.startCommunication.type, startCommunicationSaga);
  yield takeLatest(CommunicationActions.collaborate.type, collaborationSaga);

}

export function* calendarSagas() {
  yield watchCalendarEventUpdateSagas();
}
