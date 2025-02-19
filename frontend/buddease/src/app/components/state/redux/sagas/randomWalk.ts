import { endpoints } from "@/app/api/ApiEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import { RandomWalkActions } from "@/app/components/hooks/userInterface/RandomWalkActions";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { AxiosResponse } from "axios";
import { Effect, call, put, takeLatest } from "redux-saga/effects";

// Replace 'yourApiEndpoint' with the actual API endpoint
const API_BASE_URL = endpoints.randomWalk.data;

// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchRandomWalkAPI = () => axiosInstance.get(API_BASE_URL);

function* fetchRandomWalkSaga(): Generator<Effect, void, any> {
  try {
    yield put(RandomWalkActions.fetchRandomWalkRequest());
    const response: AxiosResponse<number[]> = yield call(fetchRandomWalkAPI);
    yield put(RandomWalkActions.fetchRandomWalkSuccess({ randomWalk: response.data }));
  } catch (error) {
    yield put(
      RandomWalkActions.fetchRandomWalkFailure({
        error: NOTIFICATION_MESSAGES.RandomWalk.FETCH_WALK_ERROR,
      })
    );
  }
}

function* updateRandomWalkSaga(
  action: ReturnType<typeof RandomWalkActions.updateRandomWalkRequest>
): Generator<Effect, void, any> {
  try {
    const { randomWalkId, randomWalkData } = action.payload;

    // Assuming there's an API endpoint to update a random walk
    yield call(() => axiosInstance.put(`/api/random-walks/${randomWalkId}`, randomWalkData, {
      headers: {
        "Content-Type": "application/json",
      },
    }));

    yield put(RandomWalkActions.updateRandomWalkSuccess({ randomWalk: randomWalkData }));
  } catch (error) {
    yield put(
      RandomWalkActions.updateRandomWalkFailure({
        error: NOTIFICATION_MESSAGES.RandomWalk.UPDATE_WALK_ERROR,
      })
    );
  }
}

function* removeRandomWalkSaga(
  action: ReturnType<typeof RandomWalkActions.batchRemoveRandomWalksRequest>
): Generator<Effect, void, any> {
  try {
    const { randomWalkIds } = action.payload;

    for (const randomWalkId of randomWalkIds) {
      yield call(() => axiosInstance.delete(`/api/random-walks/${randomWalkId}`));
    }

    // Dispatch success action if removal is successful
    yield put(RandomWalkActions.batchRemoveRandomWalksSuccess(randomWalkIds));
  } catch (error) {
    yield put(
      RandomWalkActions.batchRemoveRandomWalksFailure({
        error: NOTIFICATION_MESSAGES.RandomWalk.REMOVE_WALK_ERROR,
      })
    );
  }
}

// Add other sagas as needed (add, batch fetch, etc.)

export function* watchRandomWalkSagas() {
  yield takeLatest(RandomWalkActions.fetchRandomWalkRequest.type, fetchRandomWalkSaga);
  yield takeLatest(RandomWalkActions.updateRandomWalkRequest.type, updateRandomWalkSaga);
  yield takeLatest(RandomWalkActions.batchRemoveRandomWalksRequest.type, removeRandomWalkSaga);
}

export function* randomWalkSagas() {
  yield watchRandomWalkSagas();
}
