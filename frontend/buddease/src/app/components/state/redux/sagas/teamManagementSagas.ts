// teamManagementSagas.ts
import teamApi from "@/app/api/teamApi";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { TeamActions } from "@/app/components/teams/TeamActions";
import { call, put, takeLatest } from "redux-saga/effects";

// Saga logic for adding a team member
export function* addTeamMemberSaga(action: ReturnType<typeof TeamActions.addTeamMember>) {
  try {
    const { teamId, memberId } = action.payload;
    yield call(teamApi.addTeamMember, teamId, memberId);
    yield put(TeamMemberActions.addTeamMemberSuccess({ teamId, memberId }));
  } catch (error) {
    yield put(TeamActions.addTeamMemberFailure({
      error: NOTIFICATION_MESSAGES.Team.ADD_TEAM_MEMBER_ERROR
    }));
  }
}

// Saga logic for removing a team member
export function* removeTeamMemberSaga(action: ReturnType<typeof TeamActions.removeTeamMember>) {
  try {
    const { teamId, memberId } = action.payload;
    yield call(teamApi.removeTeamMember, teamId, memberId);
    yield put(TeamActions.removeTeamMemberSuccess({ teamId, memberId }));
  } catch (error) {
    yield put(TeamActions.removeTeamMemberFailure({
      error: NOTIFICATION_MESSAGES.Team.REMOVE_TEAM_MEMBER_ERROR
    }));
  }
}

// Watcher Saga: Watches for the add and remove team member actions
export function* watchTeamMemberSagas() {
  yield takeLatest(TeamActions.addTeamMember.type, addTeamMemberSaga);
  yield takeLatest(TeamActions.removeTeamMember.type, removeTeamMemberSaga);
}




// Saga logic for managing team roles
export function* manageTeamRolesSaga(action: ReturnType<typeof TeamActions.manageTeamRoles>) {
    try {
      const { teamId, roles } = action.payload;
      yield call(teamApi.manageTeamRoles, teamId, roles);
      yield put(TeamActions.manageTeamRolesSuccess({ teamId, roles }));
    } catch (error) {
      yield put(TeamActions.manageTeamRolesFailure({
        error: NOTIFICATION_MESSAGES.Team.MANAGE_TEAM_ROLES_ERROR
      }));
    }
  }
  
  // Saga logic for collaborating on projects within a team
  export function* collaborateOnProjectsSaga(action: ReturnType<typeof TeamActions.collaborateOnProjects>) {
    try {
      const { teamId, projectId } = action.payload;
      yield call(teamApi.collaborateOnProjects, teamId, projectId);
      yield put(TeamActions.collaborateOnProjectsSuccess({ teamId, projectId }));
    } catch (error) {
      yield put(TeamActions.collaborateOnProjectsFailure({
        error: NOTIFICATION_MESSAGES.Team.COLLABORATE_ON_PROJECTS_ERROR
      }));
    }
  }
  