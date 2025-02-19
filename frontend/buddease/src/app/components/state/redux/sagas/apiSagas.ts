// apiSagas.ts
import { ApiActions } from "@/app/api/ApiActions";
import { Config, configManager } from "@/app/api/ApiConfig";
import { ApiConfig } from "@/app/configs/ConfigurationService";
import axios, { AxiosResponse } from "axios";
import { call, put, select, takeLatest } from "redux-saga/effects";

const apiUrl = configManager.getConfig().apiUrl;

function* handleApiRequest(apiFunction: () => Promise<AxiosResponse>, successAction: Function, failureAction: Function) {
  try {
    const response: AxiosResponse = yield call(apiFunction);
    yield put(successAction({ data: response.data }));
  } catch (error) {
    yield put(failureAction({ error: String(error) }));
    // Log the error to a centralized logging system
    console.error('API Request Error:', error);
  }
}

function* fetchApiDataSaga(): Generator<any, void, AxiosResponse> {
  yield* handleApiRequest(
    () => axios.get(apiUrl),
    ApiActions.fetchApiDataSuccess,
    ApiActions.fetchApiDataFailure
  );
}

function* updateApiConfigSaga(): Generator<any, void, Config> {
  try {
    const newConfig: Partial<Config> = yield select((state) => state.newApiConfig);

    configManager.updateConfig(newConfig);
    yield put(ApiActions.updateApiConfigSuccess({ apiConfig: newConfig as ApiConfig }));
  } catch (error) {
    yield put(ApiActions.updateApiConfigFailure({ error: String(error) }));
    // Log the error to a centralized logging system
    console.error('Update API Config Error:', error);
  }
}

export function* watchApiSagas() {
  yield takeLatest(ApiActions.fetchApiDataRequest.type, fetchApiDataSaga);
  yield takeLatest(ApiActions.updateApiConfigRequest.type, updateApiConfigSaga);
}

export function* apiSagas() {
  yield watchApiSagas();
}
