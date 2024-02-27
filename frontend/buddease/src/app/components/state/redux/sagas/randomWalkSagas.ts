// randomWalkSagas.ts
import { RandomWalkActions } from "@/app/components/hooks/userInterface/RandomWalkActions";
import { useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { all, call, put, takeLatest } from "redux-saga/effects";

// Simulate an asynchronous API call for random walks
const simulateRandomWalksAPI = (): Promise<number[]> => {
  return new Promise<number[]>((resolve, reject) => {
    // Simulating success after a delay
    setTimeout(() => {
      resolve([1, 2, 3]);
    }, 1000);
    // Simulating failure after a delay
    // Uncomment the lines below to simulate failure
    // setTimeout(() => {
    //   reject(new Error("Random walk fetch failed"));
    // }, 1000);
  });
};

// Saga for handling single random walk requests
function* handleRandomWalkRequest(action: ReturnType<typeof RandomWalkActions.fetchRandomWalkRequest>) {
  const { addNotification } = useNotification();

  try {
    // Simulate API call
    const randomWalk = yield call(simulateRandomWalksAPI);

    // Dispatch success action with custom notification message
    yield put(RandomWalkActions.fetchRandomWalkSuccess({ randomWalk }));

    // Notify success
    addNotification(notification);
  } catch (error: any) {
    // Dispatch failure action
    yield put(RandomWalkActions.fetchRandomWalkFailure({ error: error.message }));

    // Notify failure
    addNotification(NOTIFICATION_MESSAGES.Error.DEFAULT("random walk"));
    console.error("Error fetching random walk:", error);
  }
}

// Saga for handling batch random walk requests
function* handleBatchRandomWalkRequest(action: ReturnType<typeof RandomWalkActions.batchFetchRandomWalksRequest>) {
  const { addNotification } = useNotification();

  try {
    // Simulate API call for batch random walks
    const randomWalks = yield call(simulateRandomWalksAPI);

    // Dispatch success action
    yield put(RandomWalkActions.batchFetchRandomWalksSuccess({ randomWalks }));
  } catch (error: any) {
    // Dispatch failure action
    yield put(RandomWalkActions.batchFetchRandomWalksFailure({ error: error.message }));

    // Notify failure
    addNotification(NOTIFICATION_MESSAGES.Error.DEFAULT("random walks"), error);
    console.error("Error fetching batch random walks:", error);
  }
}

// Watcher saga to listen for random walk-related actions
function* watchRandomWalkActions() {
  yield takeLatest(RandomWalkActions.fetchRandomWalkRequest.type, handleRandomWalkRequest);
  yield takeLatest(RandomWalkActions.batchFetchRandomWalksRequest.type, handleBatchRandomWalkRequest);
  // Add more watchers for other random walk actions if needed
}

// Root saga combining all random walk sagas
export function* randomWalkSagas() {
  yield all([
    watchRandomWalkActions(),
    // Add other random walk sagas here if needed
  ]);
}
