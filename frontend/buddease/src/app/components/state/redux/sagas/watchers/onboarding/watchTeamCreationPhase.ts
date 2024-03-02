import * as teamAPI from '@/app/api/TeamApi';
import { TeamCreationPhaseActions } from "@/app/components/phases/actions/TeamCreationPhaseActions";
import { all, call, takeLatest } from "redux-saga/effects";

// Worker saga for handling actions related to Team Creation Phase
function* handleTeamCreationPhaseActions(action: any): Generator<any, void, any> {
    try {
        const { payload } = action;

    switch (action.type) {
      case TeamCreationPhaseActions.updateTeamCreationPhase.type:
        // Call API to update team creation phase data
        yield call(teamAPI.updateTeamCreationPhase, payload.id, payload.newData);
        // Dispatch success action if needed
        // yield put({ type: TeamCreationPhaseActions.updateTeamCreationPhaseSuccess.type });
        break;

      case TeamCreationPhaseActions.deleteTeamCreationPhase.type:
        // Call API to delete team creation phase data
        yield call(teamCreationPhaseAPI.deleteTeamCreationPhase, payload);
        // Dispatch success action if needed
        // yield put({ type: TeamCreationPhaseActions.deleteTeamCreationPhaseSuccess.type });
        break;

      case TeamCreationPhaseActions.fetchTeamCreationPhaseRequest.type:
        // Call API to fetch team creation phase data
        const teamCreationPhaseData = yield call(teamCreationPhaseAPI.fetchTeamCreationPhase);
        // Dispatch success action with fetched data
        yield put({ type: TeamCreationPhaseActions.fetchTeamCreationPhaseSuccess.type, payload: teamCreationPhaseData });
        break;

      case TeamCreationPhaseActions.addPhase.type:
        // Call API to add new team creation phase
        yield call(teamCreationPhaseAPI.addTeamCreationPhase, payload);
        // Dispatch success action if needed
        // yield put({ type: TeamCreationPhaseActions.addPhaseSuccess.type });
        break;

      // Handle other action types similarly

      default:
        break;
    }

        // If needed, dispatch success action
        // yield put({ type: TeamCreationPhaseActions.fetchTeamCreationPhaseSuccess.type });

    } catch (error: any) {
        // If an error occurs, dispatch failure action
        // yield put({ type: TeamCreationPhaseActions.fetchTeamCreationPhaseFailure.type, payload: error.message });
    }
}

// Watcher saga to listen for actions related to Team Creation Phase
export function* watchTeamCreationPhase() {
    yield all([
        takeLatest(TeamCreationPhaseActions.updateTeamCreationPhase.type, handleTeamCreationPhaseActions),
        takeLatest(TeamCreationPhaseActions.deleteTeamCreationPhase.type, handleTeamCreationPhaseActions),
        takeLatest(TeamCreationPhaseActions.fetchTeamCreationPhaseRequest.type, handleTeamCreationPhaseActions),
        takeLatest(TeamCreationPhaseActions.addPhase.type, handleTeamCreationPhaseActions),
        // Add more action types as needed
    ]);
}

// Watcher saga to listen for actions related to Team Creation Phase actions
export function* watchTeamCreationPhaseActions() {
    // Implement logic to watch for specific actions related to Team Creation Phase actions
    // and call corresponding handler functions
}
