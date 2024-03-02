
// clientSaga.ts
import { clientApiService } from "@/app/components/models/client/ClientService"; // Adjust the import path accordingly
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages"; // Adjust the import path accordingly
import clientConfig from "@/app/configs/clientConfig"; // Adjust the import path accordingly
import { call, put, takeLatest } from "redux-saga/effects";
import { ClientActions } from "../actions/ClientActions";

// Worker Saga: Fetch Client Details
function* fetchClientDetailsSaga(action: any) {
  try {
    const clientId = action.payload;
    // Adjust the service method accordingly
    const clientDetails = yield call(clientApiService.fetchClientDetails, clientId);
    yield put(ClientActions.fetchClientDetailsSuccess({ clientDetails }));
  } catch (error) {
    yield put(
      ClientActions.fetchClientDetailsFailure({
        error: NOTIFICATION_MESSAGES.Client.FETCH_CLIENT_DETAILS_ERROR,
      })
    );
  }
}

// Worker Saga: Update Client Details
function* updateClientDetailsSaga(action: any) {
  try {
    const { clientId, clientData } = action.payload;
    // Adjust the service method accordingly
    const updatedClientDetails = yield call(clientApiService.updateClientDetails, clientId, clientData);
    yield put(ClientActions.updateClientDetailsSuccess({ clientId, clientDetails: updatedClientDetails }));
  } catch (error) {
    yield put(
      ClientActions.updateClientDetailsFailure({
        error: NOTIFICATION_MESSAGES.Client.UPDATE_CLIENT_DETAILS_ERROR,
      })
    );
  }
}

// Watcher Saga: Watches for the fetch and update client details actions
function* watchClientSagas() {
  yield takeLatest(ClientActions.fetchClientDetailsRequest.type, fetchClientDetailsSaga);
  yield takeLatest(ClientActions.updateClientDetailsRequest.type, updateClientDetailsSaga);
}

// Export the client saga
export function* clientSagas() {
  yield watchClientSagas();
}

//todo update to use errorMessage
const errorMessage = clientConfig.notificationMessages.updateClientDetailsError;
