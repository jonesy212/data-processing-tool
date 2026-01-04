featureSaga.ts
Example Redux Saga for a Feature
import { fetchFeatureData } from "@/core/state/redux/sagas/apiSagas";
import { fetchFeatureDataFailure, fetchFeatureDataSuccess } from "@/core/users/featureSlice";
import { call, put, takeLatest } from "redux-saga/effects";

function* handleFetchFeatureData(action) {
  try {
    const featureData = yield call(fetchFeatureData, action.payload);
    yield put(fetchFeatureDataSuccess(featureData));
  } catch (error) {
    yield put(fetchFeatureDataFailure(error.message));
  }
}

function* featureSaga() {
  yield takeLatest("feature/fetchData", handleFetchFeatureData);
}

export default featureSaga;
