// calendar/CalendarSagas.ts
import { CalendarActions } from "@/app/components/calendar/CalendarActions";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import axios, { AxiosResponse } from "axios";
import { Effect, call, put, select, takeLatest } from "redux-saga/effects";
import { CalendarEvent } from "../../stores/CalendarStore";

// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchCalendarEventsAPI = () => axios.get("/api/calendar-events");

function* addCalendarEventSaga(
  action: ReturnType<typeof CalendarActions.addEvent>
): Generator<Effect, void, any> {
  try {
    // Add your logic to handle adding a calendar event
    const { payload: newEvent } = action;

    // Assuming there's an API endpoint to add a calendar event
    const response: AxiosResponse<CalendarEvent> = yield call(() =>
      axios.post("/api/calendar-events", newEvent, {
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
    // Fetch calendar events logic
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
    // Remove calendar event logic
    const { payload: eventId } = action;

    yield call(() => axios.delete(`/api/calendar-events/${eventId}`));

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

// Add other sagas as needed (update, complete, etc.)

export const calendarSagas = [
  takeLatest(CalendarActions.addEvent.type, addCalendarEventSaga),
  takeLatest(CalendarActions.removeEvent.type, removeCalendarEventSaga),
  takeLatest(CalendarActions.fetchCalendarEventsRequest.type, fetchCalendarEventsSaga),
  // Add other sagas watchers here
];
