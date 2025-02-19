// authorizationSagas.ts
import { AxiosResponse } from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import { AuthActions } from "@/app/components/actions/AuthActions";
import { UpdateDataTitle, UpdateDataDescription, UpdateDataDetails, UpdateDataStatus, AddData, RemoveData } from "./authorizationApi";
import { AuthorizationActions } from "@/app/components/actions/AuthorizationActions";

function* handleUpdateDataTitle(action: ReturnType<typeof AuthActions.updateDataTitle>): Generator<any, void, any> {
  try {
    const { payload } = action;
    const response: AxiosResponse<any> = yield call(UpdateDataTitle, payload.title);
    // Dispatch action for success
    yield put(AuthorizationActions.updateDataTitleSuccess(response.data));
  } catch (error) {
    // Dispatch action for failure
    yield put(AuthorizationActions.updateDataTitleFailure(error));
  }
}

function* handleUpdateDataDescription(action: ReturnType<typeof AuthActions.updateDataDescription>): Generator<any, void, any> {
  try {
    const { payload } = action;
    yield call(UpdateDataDescription, payload.description);
    // Dispatch action for success if needed
  } catch (error) {
    // Dispatch action for failure if needed
  }
}

function* handleUpdateDataStatus(action: ReturnType<typeof AuthActions.updateDataStatus>): Generator<any, void, any> {
  try {
    const { payload } = action;
    yield call(UpdateDataStatus, payload.status);
    // Dispatch action for success if needed
  } catch (error) {
    // Dispatch action for failure if needed
  }
}

function* handleUpdateDataDetails(action: ReturnType<typeof AuthActions.updateDataDetails>): Generator<any, void, any> {
  try {
    const { payload } = action;
    yield call(UpdateDataDetails, payload.dataId, payload.updatedDetails);
    // Dispatch action for success if needed
  } catch (error) {
    // Dispatch action for failure if needed
  }
}

function* handleAddData(action: ReturnType<typeof AuthActions.addData>): Generator<any, void, any> {
  try {
    const { payload } = action;
    yield call(AddData, payload.id, payload.title);
    // Dispatch action for success if needed
  } catch (error) {
    // Dispatch action for failure if needed
  }
}

function* handleRemoveData(action: ReturnType<typeof AuthActions.removeData>): Generator<any, void, any> {
  try {
    const { payload } = action;
    yield call(RemoveData, payload);
    // Dispatch action for success if needed
  } catch (error) {
    // Dispatch action for failure if needed
  }
}

// Watcher saga
function* watchAuthorizationActions() {
  yield takeLatest(AuthActions.updateDataTitle.type, handleUpdateDataTitle);
  yield takeLatest(AuthActions.updateDataDescription.type, handleUpdateDataDescription);
  yield takeLatest(AuthActions.updateDataStatus.type, handleUpdateDataStatus);
  yield takeLatest(AuthActions.updateDataDetails.type, handleUpdateDataDetails);
  yield takeLatest(AuthActions.addData.type, handleAddData);
  yield takeLatest(AuthActions.removeData.type, handleRemoveData);
}

export function* authorizationSagas() {
  yield watchAuthorizationActions();
}
