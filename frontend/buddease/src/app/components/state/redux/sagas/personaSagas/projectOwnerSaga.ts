// projectOwnerSaga.ts
import projectOwnerApiService from "@/app/api/ProjectOwnerApi";
import { ProjectOwnerActions } from "@/app/components/actions/ProjectOwnerActions";
import { Team } from "@/app/components/models/teams/Team";
import { TeamMember } from "@/app/components/models/teams/TeamMembers";
import Project, { ProjectType } from "@/app/components/projects/Project";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { call, put, takeLatest } from "redux-saga/effects";

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
    yield put(ProjectOwnerActions.inviteMemberSuccess({ success: "Invite member success message" }));

  } catch (error) {
    yield put(
      ProjectOwnerActions.inviteMemberFailure({
        error: NOTIFICATION_MESSAGES.ProjectOwner.INVITE_MEMBER_ERROR,
      })
    );
  }
}



// Watcher Saga: Update Meeting
function* updateMeetingSaga(action: any) {
  try {
    const { projectId, memberId } = action.payload;
    yield call(projectOwnerApiService.updateMeeting, projectId, memberId); // Adjust the service method accordingly
    yield put(ProjectOwnerActions.updateMeetingSuccess({
      success: true,
    }));
  } catch (error) {
    yield put(
      ProjectOwnerActions.updateMeetingFailure({
        error: NOTIFICATION_MESSAGES.ProjectOwner.UPDATE_MEETING_ERROR,
      })
    );
  }
}

// Watcher Saga: Delete Meeting
function* deleteMeetingSaga(action: any) {
  try {
    const meetingId = action.payload;
    yield call(projectOwnerApiService.deleteMeeting, meetingId); // Adjust the service method accordingly
    yield put(ProjectOwnerActions.deleteMeetingSuccess(true));
  } catch (error) {
    yield put(
      ProjectOwnerActions.deleteMeetingFailure({
        error: NOTIFICATION_MESSAGES.ProjectOwner.DELETE_MEETING_ERROR,
      })
    );
  }
}
// Fetch updated project details saga
import { PayloadAction } from '@reduxjs/toolkit';

// Fetch updated project details saga
function* fetchUpdatedProjectDetailsSaga(action: PayloadAction<{ projectId: Project }>): Generator<any, void, any> {
  try {
    const { projectId } = action.payload;
    const updatedProjectDetails = yield call(projectOwnerApiService.fetchUpdatedProjectDetails, projectId);
    yield put(ProjectOwnerActions.fetchUpdatedProjectSuccess(updatedProjectDetails));
  } catch (error) {
    yield put(ProjectOwnerActions.fetchUpdatedProjectFailure({ error: "Unable to update project" }));
  }
}


// Update project details saga
function* updatedProjectDetailsSaga(action: PayloadAction<{ project: Project; type: string }>) {
  try {
    const { project, type } = action.payload;
    // Update project details logic
    yield put(ProjectOwnerActions.updateProjectSuccess({ project, type }));
  } catch (error) {
    yield put(ProjectOwnerActions.updateProjectFailure({ error: "Unable to update project" }));
  }
}


function* updateProjectFailureSaga(project: Project, type: ProjectType) {
  try {
    // Perform actions related to handling project failure based on the project type
    console.log(`Updating project failure for project ID: ${project.id} with type: ${type}`);

    // Example actions:
    // - Log the failure
    // - Notify relevant stakeholders
    // - Trigger a rollback or cleanup process

    // Yield additional generator function calls or side effects as needed
  } catch (error) {
    // Handle any potential errors or exceptions
    console.error('Error updating project failure:', error.message);
  }
}

// Update team member saga
function* updateTeamMemberSaga(action: { payload: { member: TeamMember[], team: Team } }) {
  try {
    const { member, team } = action.payload;
    // Update team member logic
    yield put(ProjectOwnerActions.updateTeamMemberSuccess(true));
  } catch (error:any) {
    yield put(ProjectOwnerActions.updateTeamFailure(error.message));
  }
}

// Remove team member saga
function* removeTeamMemberSaga(action: { payload: boolean }) {
  try {
    const isSuccess = action.payload;
    // Remove team member logic
    if (isSuccess) {
      yield put(ProjectOwnerActions.removeTeamMemberSuccess(true));
    } else {
      yield put(ProjectOwnerActions.removeTeamMemberFailure({error: 'Failed to remove team member'}));
    }
  } catch (error) {
    yield put(ProjectOwnerActions.removeTeamMemberFailure({error: 'Failed to remove team member'}));
  }
}

function* watchProjectOwnerSaga() {
  yield takeLatest(ProjectOwnerActions.createProjectRequest.type, createProjectSaga);
  yield takeLatest(ProjectOwnerActions.inviteMemberRequest.type, inviteMemberSaga);
  yield takeLatest(ProjectOwnerActions.updateMeetingRequest.type, updateMeetingSaga);
  yield takeLatest(ProjectOwnerActions.deleteMeetingRequest.type, deleteMeetingSaga);
  
  // Fetch project details sagas
  yield takeLatest(ProjectOwnerActions.fetchUpdatedProjectDetailsRequest.type, fetchUpdatedProjectDetailsSaga);
  
  // Update project sagas
  yield takeLatest(ProjectOwnerActions.updatedProjectDetails.type, updatedProjectDetailsSaga);
  yield takeLatest(ProjectOwnerActions.updateProjectFailure.type, updateProjectFailureSaga);
  yield takeLatest(ProjectOwnerActions.deleteProjectSuccess.type, deleteProjectSuccessSaga);
  
  // Update team member sagas
  yield takeLatest(ProjectOwnerActions.udpateTeamMember.type, udpateTeamMemberSaga);
  yield takeLatest(ProjectOwnerActions.updateTeamMemberRequest.type, updateTeamMemberRequestSaga);
  yield takeLatest(ProjectOwnerActions.updateTeamMemberSuccess.type, updateTeamMemberSuccessSaga);
  yield takeLatest(ProjectOwnerActions.updateTeamMembers.type, updateTeamMembersSaga);
  yield takeLatest(ProjectOwnerActions.updateTeamFailure.type, updateTeamFailureSaga);
  
  // Remove team member sagas
  yield takeLatest(ProjectOwnerActions.removeTeamMember.type, removeTeamMemberSaga);
  yield takeLatest(ProjectOwnerActions.removeTeamMemberRequest.type, removeTeamMemberRequestSaga);
  yield takeLatest(ProjectOwnerActions.removeTeamMemberSuccess.type, removeTeamMemberSuccessSaga);
  yield takeLatest(ProjectOwnerActions.removeTeamMemberFailure.type, removeTeamMemberFailureSaga);

  // Add other sagas as needed
}
// Export the project owner saga
export function* projectOwnerSaga() {
  yield watchProjectOwnerSaga();
}
