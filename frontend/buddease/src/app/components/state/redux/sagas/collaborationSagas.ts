// collaborationSagas.ts
import collaborationApiService from "@/app/api/ApiCollaboration";
import { CollaborationActions } from "@/app/components/actions/CollaborationActions";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { Effect, call, put, takeLatest } from "redux-saga/effects";

function* fetchCollaborationSaga(): Generator<Effect, void, any> {
  try {
    yield put(CollaborationActions.fetchCollaborationRequest());
    // Replace with the actual API call or service function to fetch collaboration data
    const collaborationData: any = yield call(collaborationApiService.fetchCollaborationData);
    yield put(CollaborationActions.fetchCollaborationSuccess({ collaborationData }));
  } catch (error) {
    yield put(
      CollaborationActions.fetchCollaborationFailure({
        error: NOTIFICATION_MESSAGES.Collaboration.FETCH_ERROR,
      })
    );
  }
}

function* fetchCollaborationRequestSaga(): Generator<Effect, void, any> {
  try {
    yield put(CollaborationActions.fetchCollaborationRequest());
    // Use collaboration service to fetch collaboration data
    const collaborationData: any = yield call(collaborationService.fetchCollaborationData);
    yield put(CollaborationActions.fetchCollaborationSuccess({ collaborationData }));
  } catch (error) {
    yield put(CollaborationActions.fetchCollaborationFailure({ error: String(error) }));
  }
}

function* fetchCollaborationSuccessSaga(
  action: ReturnType<typeof CollaborationActions.fetchCollaborationSuccess>
): Generator<Effect, void, any> {
  try {
    const { collaborationData } = action.payload;
    // Handle the success action
    // Update the state or perform other actions based on the fetched collaboration data
    yield put({
      type: 'UPDATE_COLLABORATION_ACTION_TYPE', // Replace with your actual action type for updating collaboration data
      payload: { collaborationData },
    });
    console.log('Fetch Collaboration Success:', collaborationData);
  } catch (error) {
    console.error('Error in fetchCollaborationSuccessSaga:', error);
  }
}

export function* watchCollaborationSagas() {
  yield takeLatest(CollaborationActions.fetchCollaborationRequest.type, fetchCollaborationSaga);
  yield takeLatest(CollaborationActions.fetchCollaborationRequest.type, fetchCollaborationRequestSaga);
  yield takeLatest(CollaborationActions.fetchCollaborationSuccess.type, fetchCollaborationSuccessSaga);
  // Add more sagas as needed for other collaboration actions
}

export function* collaborationSagas() {
  yield watchCollaborationSagas();
}
