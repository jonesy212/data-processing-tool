// collaborationSagas.ts
import collaborationApiService from "@/app/api/ApiCollaboration";
import { CollaborationActions } from "@/app/components/actions/CollaborationActions";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { Effect, call, put, takeLatest } from "redux-saga/effects";

function* fetchCollaborationSaga(action: any): Generator<Effect, void, any> {
  try {
    const projectId = action.payload;
    yield put(CollaborationActions.fetchCollaborationRequest());
    const collaborationData: any = yield call(
      collaborationApiService.fetchCollaborationData,
      projectId
    );
    yield put(
      CollaborationActions.fetchCollaborationSuccess({ collaborationData })
    );
  } catch (error) {
    yield put(
      CollaborationActions.fetchCollaborationFailure({
        error: NOTIFICATION_MESSAGES.Collaboration.FETCH_ERROR,
      })
    );
  }
}

function* fetchCollaborationRequestSaga(
  action: any
): Generator<Effect, void, any> {
  try {
    const projectId = action.payload;

    yield put(CollaborationActions.fetchCollaborationRequest());
    // Use collaboration service to fetch collaboration data
    const collaborationData: any = yield call(
      collaborationApiService.fetchCollaborationData,
      projectId
    );
    yield put(
      CollaborationActions.fetchCollaborationSuccess({ collaborationData })
    );
    yield put(CollaborationActions.fetchCollaboration(projectId));
  } catch (error) {
    yield put(
      CollaborationActions.fetchCollaborationFailure({ error: String(error) })
    );
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
      type: "UPDATE_COLLABORATION_ACTION_TYPE", // Replace with your actual action type for updating collaboration data
      payload: { collaborationData },
    });
    console.log("Fetch Collaboration Success:", collaborationData);
  } catch (error) {
    console.error("Error in fetchCollaborationSuccessSaga:", error);
  }
}

function* watchCollaborationSagas(): Generator<Effect, void, any> {
  yield takeLatest(
    CollaborationActions.fetchCollaborationRequest.type,
    fetchCollaborationRequestSaga
  );
  yield takeLatest(
    CollaborationActions.fetchCollaborationSuccess.type,
    fetchCollaborationSuccessSaga
  );
  yield takeLatest(
    CollaborationActions.fetchCollaboration.type,
    fetchCollaborationSaga
  )
}

export function* collaborationSagas() {
  yield watchCollaborationSagas();
}
