// markerSagas.ts

import { Marker } from '@/app/components/models/data/Marker';
import { AxiosResponse } from 'axios';
import { Effect, call, put, takeLatest } from 'redux-saga/effects';
import { MarkerActions } from '../components/state/redux/actions/MarkerActions';
import NOTIFICATION_MESSAGES from '../components/support/NotificationMessages';
import { endpoints } from './ApiEndpoints';
import axiosInstance from './axiosInstance';

const API_BASE_URL = endpoints.marker

function* fetchMarkersSaga(): Generator<Effect, void, any> {
  try {
    yield put(MarkerActions.fetchMarkersRequest());
    const response: AxiosResponse<Marker[]> = yield call(axiosInstance.get, `${API_BASE_URL}/fetchMarkers`); // Using API_BASE_URL
    yield put(MarkerActions.fetchMarkersSuccess({ markers: response.data }));
  } catch (error) {
    yield put(
      MarkerActions.fetchMarkersFailure({
        error: NOTIFICATION_MESSAGES.Markers.MARKER_FETCH_ERROR,
      })
    );
  }
}

function* addMarkerSaga(action: ReturnType<typeof MarkerActions.addMarker>): Generator<Effect, void, any> {
  try {
    const { payload: newMarker } = action;
    const response: AxiosResponse<Marker> = yield call(axiosInstance.post, `${API_BASE_URL}/addMarker`, newMarker); // Using API_BASE_URL
    yield put(MarkerActions.updateMarkersSuccess({ markers: [response.data] }));
  } catch (error) {
    yield put(
      MarkerActions.updateMarkerFailure({
        error: NOTIFICATION_MESSAGES.Markers.MARKER_ADD_ERROR,
      })
    );
  }
}

function* deleteMarkerSaga(action: ReturnType<typeof MarkerActions.deleteMarker>): Generator {
  try {
    const { payload: markerId } = action;
    yield call(axiosInstance.delete, `${API_BASE_URL}/removeMarker/${markerId}`); // Using API_BASE_URL
    yield put(MarkerActions.deleteMarkerSuccess(markerId));
  } catch (error) {
    yield put(
      MarkerActions.updateMarkerFailure({
        error: NOTIFICATION_MESSAGES.Markers.MARKER_REMOVE_ERROR,
      })
    );
  }
}


// Other sagas related to marker actions can be updated similarly

export function* watchMarkerSagas() {
  yield takeLatest(MarkerActions.fetchMarkersRequest.type, fetchMarkersSaga);
  yield takeLatest(MarkerActions.addMarker.type, addMarkerSaga);
  yield takeLatest(MarkerActions.deleteMarker.type, deleteMarkerSaga);
  // Add more sagas as needed
}

export function* markerSagas() {
  yield watchMarkerSagas();
}
