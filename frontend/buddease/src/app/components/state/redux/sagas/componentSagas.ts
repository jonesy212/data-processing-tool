import { ComponentActions } from '@/app/components/libraries/ui/components/ComponentActions';
import { apiComponent } from '@/app/components/libraries/api/apiComponent';
import ApiConfigComponent from '@/app/configs/ApiConfigComponent';
//componentSagas.ts

import { call, put } from "redux-saga/effects";

// Saga function to handle fetching a component
const apiComponent: ApiConfigComponent = {
  props: {
    // Provide the required props here
  },
};
function* fetchComponent(action: ReturnType<typeof ComponentActions.fetchComponentRequest>) {
  try {
    const response = yield call(apiComponent.fetchComponent, action.payload);
    yield put(ComponentActions.fetchComponentSuccess(response.data));
  } catch (error: any) {
    yield put(ComponentActions.fetchComponentFailure(error.message));
  }
}

// Saga function to handle updating a component success
function* updateComponentSuccessSaga(action) {
  try {
    // Perform any additional logic needed for update success
    yield put(ComponentActions.updateComponentSuccessAdditionalLogic(action.payload));
  } catch (error: any) {
    // Handle error if additional logic fails
    yield put(ComponentActions.updateComponentFailure(error.message));
  }
}

// Saga function to handle updating a component failure
function* updateComponentFailureSaga(action) {
  try {
    // Perform any additional logic needed for update failure
    yield put(ComponentActions.updateComponentFailureAdditionalLogic(action.payload));
  } catch (error: any) {
    // Handle error if additional logic fails
    yield put(ComponentActions.updateComponentFailure(error.message));
  }
}

// Watcher saga to listen for specific actions and run corresponding sagas
export function* watchComponentActions() {
  yield takeLatest(ComponentActions.addComponent.type, addComponentSaga);
  yield takeLatest(ComponentActions.removeComponent.type, removeComponentSaga);
  yield takeLatest(ComponentActions.updateComponent.type, updateComponentSaga);
  yield takeLatest(ComponentActions.fetchComponentRequest.type, fetchComponentSaga);
  yield takeLatest(ComponentActions.updateComponentSuccess.type, updateComponentSuccessSaga);
  yield takeLatest(ComponentActions.updateComponentFailure.type, updateComponentFailureSaga);
}
