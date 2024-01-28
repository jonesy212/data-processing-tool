// calendar/CalendarSagas.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import { CalendarActions } from "@/app/components/calendar/CalendarActions";
import { CommunicationActions } from '@/app/components/community/CommunicationActions';
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { AxiosResponse } from "axios";
import { Effect, call, put, select, takeLatest } from "redux-saga/effects";
import { CalendarEvent } from "../../stores/CalendarStore";
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
  yield takeLatest(CalendarActions.addEvent.type, addCalendarEventSaga);
  yield takeLatest(CalendarActions.removeEvent.type, removeCalendarEventSaga);
  yield takeLatest(CalendarActions.fetchCalendarEventsRequest.type, fetchCalendarEventsSaga);
  // Communication sagas
  yield takeLatest(CommunicationActions.startCommunication.type, startCommunicationSaga);
  yield takeLatest(CommunicationActions.collaborate.type, collaborationSaga);
}

export function* calendarSagas() {
  yield watchCalendarEventUpdateSagas();
}
