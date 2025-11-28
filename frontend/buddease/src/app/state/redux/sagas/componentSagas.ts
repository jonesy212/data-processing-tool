// componentSagas.ts
// /app/sagas/componentSagas.ts
import { takeLatest, call, put } from "redux-saga/effects";
import { ComponentActions } from "@/app/actions/ComponentActions";
import { apiComponentService } from "@/app/services/apiComponentService";

function* fetchComponentSaga(
  action: ReturnType<typeof ComponentActions.fetchComponentRequest>
): Generator<any, void, any> {
  try {
    const response = yield call(apiComponentService.fetchComponent, action.payload);
    yield put(ComponentActions.fetchComponentSuccess(response.data));
  } catch (err: any) {
    yield put(ComponentActions.fetchComponentFailure(err?.message ?? "Unknown error"));
  }
}

function* updateComponentSaga(
  action: ReturnType<typeof ComponentActions.updateComponent>
): Generator<any, void, any> {
  try {
    const response = yield call(apiComponentService.updateComponent, action.payload);
    yield put(ComponentActions.updateComponentSuccess(response.data));
  } catch (err: any) {
    yield put(ComponentActions.updateComponentFailure(err?.message ?? "Unknown error"));
  }
}

export function* watchComponentActions(): Generator {
  yield takeLatest(ComponentActions.fetchComponentRequest.type, fetchComponentSaga);
  yield takeLatest(ComponentActions.updateComponent.type, updateComponentSaga);
}
