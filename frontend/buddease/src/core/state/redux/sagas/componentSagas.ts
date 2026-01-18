// componentSagas.ts
/app/sagas/componentSagas.ts
import { ComponentActions } from "@/core/actions/ComponentActions";
import { apiComponentService } from "@/core/services/apiComponentService";
import { call, put, takeLatest } from "redux-saga/effects";

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
