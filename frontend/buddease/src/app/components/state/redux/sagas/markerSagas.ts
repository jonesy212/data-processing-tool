// markerSagas.ts
import { Marker } from '@/app/components/models/data/Marker';
import axios, { AxiosResponse } from 'axios';
import { Effect, call, put, takeLatest } from 'redux-saga/effects';
import NOTIFICATION_MESSAGES from '../../../support/NotificationMessages';
import { MarkerActions } from '../actions/MarkerActions';
import { markerService } from '@/app/components/marker/MarkerService';


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

function* addMarkerSaga(action: ReturnType<typeof MarkerActions.addMarker>): Generator {
  try {
    const { payload: newMarker } = action;
    const response = yield call(markerService.addMarker, {
      marker: {
        ...newMarker
      }
    });
    // Handle success
  } catch (error: any) { // Specify 'any' type for 'error'
    yield put(MarkerActions.updateMarkerFailure({ error: error.message }));
  }
}


function* removeMarkerSaga(action: ReturnType<typeof MarkerActions.deleteMarker>): Generator {
  try {
    const { payload: markerId } = action;
    yield call(markerService.removeMarker, markerId);
    // Update the state or handle success if needed
    yield put(MarkerActions.deleteMarkerSuccess(markerId));
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
  yield takeLatest(MarkerActions.addMarker.type, addMarkerSaga);
  yield takeLatest(MarkerActions.deleteMarker.type, removeMarkerSaga);
  // Add more sagas as needed
}

export function* markerSagas() {
  yield watchMarkerSagas();
}
