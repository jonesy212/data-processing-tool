// featureSaga.ts
// Example Redux Saga for a Feature
import { call, put, takeLatest } from "redux-saga/effects";
import { fetchFeatureData } from "@/app/state/redux/sagas/apiSagas";
import { fetchFeatureDataFailure, fetchFeatureDataSuccess } from "@/app/users/featureSlice";

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
