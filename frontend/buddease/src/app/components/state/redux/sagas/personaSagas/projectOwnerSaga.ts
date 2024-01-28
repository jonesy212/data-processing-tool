// projectOwnerSaga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import { ProjectOwnerActions } from "../actions/ProjectOwnerActions";
import { projectOwnerApiService } from "@/app/components/models/ProjectOwnerService";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";

// Worker Saga: Create Project
function* createProjectSaga(action: any) {
  try {
    const projectData = action.payload;
    yield call(projectOwnerApiService.createProject, projectData); // Adjust the service method accordingly
    yield put(ProjectOwnerActions.createProjectSuccess());
  } catch (error) {
    yield put(
      ProjectOwnerActions.createProjectFailure({
        error: NOTIFICATION_MESSAGES.ProjectOwner.CREATE_PROJECT_ERROR,
      })
    );
  }
}

// Worker Saga: Invite Member
function* inviteMemberSaga(action: any) {
  try {
    const { projectId, memberId } = action.payload;
    yield call(projectOwnerApiService.inviteMember, projectId, memberId); // Adjust the service method accordingly
    yield put(ProjectOwnerActions.inviteMemberSuccess());
  } catch (error) {
    yield put(
      ProjectOwnerActions.inviteMemberFailure({
        error: NOTIFICATION_MESSAGES.ProjectOwner.INVITE_MEMBER_ERROR,
      })
    );
  }
}

// Watcher Saga: Watches for the create project and invite member actions
function* watchProjectOwnerSaga() {
  yield takeLatest(ProjectOwnerActions.createProjectRequest.type, createProjectSaga);
  yield takeLatest(ProjectOwnerActions.inviteMemberRequest.type, inviteMemberSaga);
}

// Export the project owner saga
export function* projectOwnerSaga() {
  yield watchProjectOwnerSaga();
}
