// teamSagas.ts
import { Team } from "@/app/components/models/teams/Team";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { TeamActions } from "@/app/components/teams/TeamActions";
import { call, put, takeLatest } from "redux-saga/effects";

// Worker Saga: Fetch Team
function* fetchTeamSaga(action: any) {
  try {
    const teamId = action.payload;
    const team: Team = yield call(apiTeam.fetchTeam, teamId); // Use apiTeam module to fetch team
    yield put(TeamActions.fetchTeamSuccess({ team }));
  } catch (error) {
    yield put(
      TeamActions.fetchTeamFailure({
        error: NOTIFICATION_MESSAGES.Team.FETCH_TEAM_ERROR,
      })
    );
  }
}

// Worker Saga: Update Team
function* updateTeamSaga(action: any) {
  try {
    const { teamId, teamData } = action.payload;
    yield call(apiTeam.updateTeam, teamId, teamData); // Use apiTeam module to update team
    yield put(TeamActions.updateTeamSuccess({ teamId, updatedTeam: teamData }));
  } catch (error) {
    yield put(
      TeamActions.updateTeamFailure({
        error: NOTIFICATION_MESSAGES.Team.UPDATE_TEAM_ERROR,
      })
    );
  }
}

// Watcher Saga: Watches for the fetch and update team actions
function* watchTeamSagas() {
  yield takeLatest(TeamActions.fetchTeamRequest.type, fetchTeamSaga);
  yield takeLatest(TeamActions.updateTeamRequest.type, updateTeamSaga);
  // Add more sagas for other team-related actions if needed
}

// Export the team sagas
export function* teamSagas() {
  yield watchTeamSagas();
}
