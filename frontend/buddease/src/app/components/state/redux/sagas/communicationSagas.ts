// communicationSagas.ts
import { CommunicationActions } from "@/app/components/community/CommunicationActions";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { all, call, put, takeLatest } from "redux-saga/effects";
import { watchIdeationPhase } from "./watchers/onboarding/watchIdeationPhase";
import { watchTeamCreationPhase } from "./watchers/watchTeamCreationPhase";

type CustomError = {
  message: string;
  // Add other properties if needed
};

// Extend Error for better type checking
type GenericError<T = unknown> = Error & T;

// Simulate an asynchronous API call for communication
const simulateCommunicationAPI = (id: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    // Simulating success after a delay
    setTimeout(() => {
      resolve();
    }, 1000);
    // Simulating failure after a delay
    // Uncomment the lines below to simulate failure
    // setTimeout(() => {
    //   reject(new Error("Communication failed"));
    // }, 1000);
  });
};

// Saga for handling single communication requests
function* handleCommunicationRequest(
  action: ReturnType<typeof CommunicationActions.startCommunicationRequest>
) {
  try {
    // Simulate API call
    yield call(simulateCommunicationAPI, action.payload);

    // Dispatch success action with custom notification message
    yield put(CommunicationActions.startCommunicationSuccess(action.payload));

    // Notify success
    const successMessage = NOTIFICATION_MESSAGES.Communication.START_SUCCESS;
    yield put(CommunicationActions.collaborateSuccess(successMessage));
  } catch (error: GenericError<CustomError> | any) {
    // Dispatch failure action
    yield put(
      CommunicationActions.startCommunicationFailure({
        id: action.payload,
        error: error.message,
      })
    );

    // Notify failure
    const failureMessage = NOTIFICATION_MESSAGES.Error.DEFAULT("communication");
    yield put(
      CommunicationActions.collaborateFailure({
        id: action.payload,
        error: failureMessage,
      })
    );
  }
}

// Saga for handling batch communication requests
function* handleBatchCommunicationRequest(
  action: ReturnType<typeof CommunicationActions.batchStartCommunication>
) {
  try {
    // Simulate API calls for each communication task
    yield all(action.payload.map((id) => call(simulateCommunicationAPI, id)));

    // Dispatch success action
    yield put(
      CommunicationActions.batchStartCommunicationSuccess(action.payload)
    );
  } catch (error: GenericError<CustomError> | any) {
    // Dispatch failure action
    yield put(
      CommunicationActions.batchStartCommunicationFailure({
        error: error.message,
      })
    );
  }
}

// Watcher saga to listen for communication-related actions
function* watchCommunicationActions() {
  yield takeLatest(
    CommunicationActions.startCommunicationRequest.type,
    handleCommunicationRequest
  );
  yield takeLatest(
    CommunicationActions.batchStartCommunication.type,
    handleBatchCommunicationRequest
  );
  // Add more watchers for other communication actions if needed
}

// Root saga combining all communication sagas
export function* communicationSagas() {
  yield all([
    watchCommunicationActions(),
    // Add other communication sagas here if needed
    
    // Add other communication sagas here if needed
    watchIdeationPhase(),
    watchTeamCreationPhase(),
    watchProductBrainstormingPhase(),
    watchProductLaunchPhase(),
    watchDataAnalysisPhase(),
    watchSchedulePlanningPhase(),
    watchAudioVideoCalls(),
    watchTextMessaging(),
    watchCollaborativeEditing(),
    watchGeneralNotifications(),
  ]);
}
