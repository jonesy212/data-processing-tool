// markerSagas.ts
import { markerService } from '@/app/components/marker/MarkerService';
import { Marker } from '@/app/components/models/data/Marker';
import axios, { AxiosResponse } from 'axios';
import { Effect, call, put, takeLatest } from 'redux-saga/effects';
import NOTIFICATION_MESSAGES from '../../../support/NotificationMessages';
import { MarkerActions } from '../actions/MarkerActions';


// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchMarkersAPI = () => axios.get('/api/markers');

function* fetchMarkersSaga(): Generator<Effect, void, any> {
  try {
    yield put(MarkerActions.fetchMarkersRequest());
    const response: AxiosResponse<Marker[]> = yield call(fetchMarkersAPI);
    yield put(MarkerActions.fetchMarkersSuccess({ markers: response.data }));
  } catch (error) {
    yield put(
      MarkerActions.fetchMarkersFailure({
        error: NOTIFICATION_MESSAGES.Markers.MARKER_FETCH_ERROR,
      })
    );
  }
}

function* addMarkerSaga(action: ReturnType<typeof MarkerActions.add>): Generator {
  try {
    const { payload: newMarker } = action;
    const response = yield call(markerService.addMarker, newMarker as Marker);
    yield put(MarkerActions.updateMarkersSuccess({ markers: [response as Marker] }));
  } catch (error) {
    yield put(
      MarkerActions.updateMarkerFailure({
        error: NOTIFICATION_MESSAGES.Markers.MARKER_ADD_ERROR,
      })
    );
  }
}

function* removeMarkerSaga(action: ReturnType<typeof MarkerActions.remove>): Generator {
  try {
    const { payload: markerId } = action;
    yield call(markerService.removeMarker, markerId);
    // Update the state or handle success if needed
    yield put(MarkerActions.removeMarkerSuccess(markerId));
  } catch (error) {
    yield put(
      MarkerActions.updateMarkerFailure({
        error: NOTIFICATION_MESSAGES.Markers.MARKER_REMOVE_ERROR,
      })
    );
  }
}

// Other sagas related to marker actions can be added similarly

export function* watchMarkerSagas() {
  yield takeLatest(MarkerActions.fetchMarkersRequest.type, fetchMarkersSaga);
  yield takeLatest(MarkerActions.add.type, addMarkerSaga);
  yield takeLatest(MarkerActions.remove.type, removeMarkerSaga);
  // Add more sagas as needed
}

export function* markerSagas() {
  yield watchMarkerSagas();
}
