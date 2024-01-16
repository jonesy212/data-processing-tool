// apiSagas.ts
import { ApiActions } from "@/app/api/ApiActions";
import { Config, configManager } from "@/app/api/ApiConfig";
import axios, { AxiosResponse } from "axios";
import { call, put, select, takeLatest } from "redux-saga/effects";
// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchApiDataAPI = () => axios.get(configManager.getConfig().apiUrl);

function* fetchApiDataSaga(): Generator<any, void, AxiosResponse> {
  try {
    const response: AxiosResponse = yield call(fetchApiDataAPI);
    yield put(ApiActions.fetchApiDataSuccess({ data: response.data }));
  } catch (error) {
    yield put(ApiActions.fetchApiDataFailure({ error: String(error) }));
  }
}

function* updateApiConfigSaga(): Generator<any, void, Config> {
  try {
    // Assume you have an action to update the API config
    const newConfig: Partial<Config> = yield select((state) => state.newApiConfig);

    configManager.updateConfig(newConfig);
    yield put(ApiActions.updateApiConfigSuccess());
  } catch (error) {
    yield put(ApiActions.updateApiConfigFailure({ error: String(error) }));
  }
}

export const apiSagas = [
  takeLatest(ApiActions.fetchApiDataRequest.type, fetchApiDataSaga),
  takeLatest(ApiActions.updateApiConfigRequest.type, updateApiConfigSaga),
];
