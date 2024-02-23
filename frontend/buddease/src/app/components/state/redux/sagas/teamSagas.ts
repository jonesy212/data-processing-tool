// teamSagas.ts
import { endpoints } from "@/app/api/ApiEndpoints";
import * as teamApi from "@/app/api/TeamApi";
import axiosInstance from "@/app/api/axiosInstance";
import { Team } from "@/app/components/models/teams/Team";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { TeamActions } from "@/app/components/teams/TeamActions";
import useModalFunctions from "@/app/pages/dashboards/ModalFunctions";
import { call, put, takeLatest } from "redux-saga/effects";

function* addTeamSaga(action: ReturnType<typeof TeamActions.addTeam>): Generator { 
  try {
    const { payload: newTeam } = action;
    const response = yield call(teamApi.addTeam, newTeam as Team);
    yield put(TeamActions.addTeamSuccess({ team: response as Team }));
  } catch (error) {
    yield put(
      TeamActions.addTeamFailure({
        error: NOTIFICATION_MESSAGES.Team.ADD_TEAM_ERROR,
      })
    );
  }
}

function* removeTeamSaga(action: ReturnType<typeof TeamActions.removeTeam>): Generator {
  try {
    const { payload: teamId } = action;
    yield call(teamApi.removeTeam, teamId);
    yield put(TeamActions.removeTeamSuccess(teamId));
  } catch (error) {
    yield put(
      TeamActions.removeTeamFailure({
        error: NOTIFICATION_MESSAGES.Team.REMOVE_TEAM_ERROR,
      })
    );
  }
}

function* fetchTeamsSaga(): Generator<any, void, any> { 
  try {
    yield put(TeamActions.fetchTeamsRequest());
    const response: any = yield call(teamApi.fetchTeams);
    yield put(TeamActions.fetchTeamsSuccess({ teams: response.data }));
  } catch (error) {
    yield put(
      TeamActions.fetchTeamsFailure({
        error: NOTIFICATION_MESSAGES.Team.FETCH_TEAMS_ERROR,
      })
    );
  }
}
export const updateTeams = async (updatedTeams: Team[]): Promise<void> => { 
  try {
    const teamIds = updatedTeams.map(team => team.id); // Extracting teamIds from updatedTeams
    await axiosInstance.put(endpoints.teams.updateTeams(teamIds), updatedTeams);
  } catch (error) {
    console.error('Error updating teams:', error);
    throw error;
  }
}


// Worker Saga: Fetch Team
function* fetchTeamSaga(action: ReturnType<typeof TeamActions.fetchTeamRequest>) {
  try {
    const { id } = action.payload;
    const team: Team = yield call(teamApi.fetchTeam, id); // Use apiTeam module to fetch team
    yield put(TeamActions.fetchTeamSuccess({ team }));
  } catch (error) {
    yield put(TeamActions.fetchTeamFailure({ error: NOTIFICATION_MESSAGES.Team.FETCH_TEAM_ERROR }));
  }
}

function* updateTeamsSaga(action: any) { 
  try {
    const { teams } = action.payload;
    yield call(updateTeams, teams);
    yield put(TeamActions.updateTeamsSuccess({  updatedTeams: teams }));
  } catch (error) {
    yield put(
      TeamActions.updateTeamsFailure({
        error: NOTIFICATION_MESSAGES.Team.UPDATE_TEAMS_ERROR,
      })
    );
  }
}


// Worker Saga: Update Team
function* updateTeamSaga(action: any) {
  try {
    const { teamId, teamData } = action.payload;
    yield call(teamApi.updateTeam, teamId, teamData); // Use apiTeam module to update team
    yield put(TeamActions.updateTeamSuccess({ teamId, updatedTeam: teamData }));
  } catch (error) {
    yield put(
      TeamActions.updateTeamFailure({
        error: NOTIFICATION_MESSAGES.Team.UPDATE_TEAM_ERROR,
      })
    );
  }
}


// Worker Saga: Add Team Success
function* addTeamSuccessSaga(action: any) {
  try {
    const { team } = action.payload;

    // Access the successMessage state from the useModalFunctions hook
    const { setSuccessMessage } = useModalFunctions();

    // Update the success message using setSuccessMessage
    setSuccessMessage(`Team "${team.name}" added successfully`);
  } catch (error) {
    console.error("Failed to add team:", error);

    // Access the errorMessage state from the useModalFunctions hook
    const { setErrorMessage } = useModalFunctions();

    // Update the error message using setErrorMessage
    setErrorMessage("Failed to add team");
  }
}

function* addTeamFailureSaga(action: any) {
  try {
    const { error } = action.payload;

    // Access the errorMessage state from the useModalFunctions hook
    const { setErrorMessage } = useModalFunctions();

    // Update the error message using setErrorMessage
    setErrorMessage(error);
  } catch (error) {
    console.error("Failed to handle add team failure:", error);

    // Access the errorMessage state from the useModalFunctions hook
    const { setErrorMessage } = useModalFunctions();

    // Update the error message using setErrorMessage
    setErrorMessage("Failed to handle add team failure");
  }
}


function* removeTeamFailureSaga(action: any) { 
  try {
    const { error } = action.payload
    console.log(error)
  } catch (error) { 
    console.error("Failed to handle remove team failure:", error);
  }
}

function* fetchTeamSuccessSaga(action: any) {
  try {
    const { team } = action.payload;

    // Access the methods and properties from the useModalFunctions hook
    const { setSuccessMessage, setIsModalOpen } = useModalFunctions();

    // Update the success message using setSuccessMessage
    setSuccessMessage(`Team "${team.name}" fetched successfully`);

    // Open the modal using setIsModalOpen
    setIsModalOpen(true);
  } catch (error) {
    console.error("Failed to handle fetch team success:", error);
  }
}


function* fetchTeamFailureSaga(action: any) {
  try {
    const { error } = action.payload;
    console.log(error)
    // Access the errorMessage state from the useModalFunctions hook
    const { setErrorMessage } = useModalFunctions();
    // Update the error message using setErrorMessage
    const { setIsModalOpen } = useModalFunctions();
    setErrorMessage(error);
    // Open the modal using setIsModalOpen
    setIsModalOpen(true);
    setErrorMessage(error);
    yield put(TeamActions.fetchTeamFailure({ error: NOTIFICATION_MESSAGES.Team.FETCH_TEAM_ERROR }));
    yield put(TeamActions.fetchTeamFailure({ error: error }));
  } catch (error) {
    console.error("Failed to handle fetch team failure:", error);
  }
}

function* updateTeamsSuccessSaga(action: any) {
  try {
    const { updatedTeams } = action.payload;
    console.log(updatedTeams)
    // Access the methods and properties from the useModalFunctions hook
    const { setSuccessMessage, setIsModalOpen } = useModalFunctions();
    // Update the success message using setSuccessMessage
    setSuccessMessage(`Teams updated successfully`);
    // Open the modal using setIsModalOpen
    setIsModalOpen(true);
    yield put(TeamActions.updateTeamsSuccess({ updatedTeams }));
  } catch (error) { 
    console.error("Failed to handle update teams success:", error);
  }
}

function* updateTeamsFailureSaga(action: any) { 
  try {
    const { error } = action.payload;
    console.log(error)
    // Access the errorMessage state from the useModalFunctions hook
    const { setErrorMessage } = useModalFunctions();
    // Update the error message using setErrorMessage
    setErrorMessage(error);
    yield put(TeamActions.updateTeamsFailure({ error: NOTIFICATION_MESSAGES.Team.UPDATE_TEAMS_ERROR }));
    yield put(TeamActions.updateTeamsFailure({ error: error }));
  } catch (error) {
    console.error("Failed to handle update teams failure:", error);
  }
}
 
function* updateTeamSuccessSaga(action: any) {
  try {
    const { teamId, updatedTeam } = action.payload;
    console.log(teamId, updatedTeam)
    // Access the methods and properties from the useModalFunctions hook
    const { setSuccessMessage, setIsModalOpen } = useModalFunctions();
    // Update the success message using setSuccessMessage
    setSuccessMessage(`Team "${updatedTeam.name}" updated successfully`);
    // Open the modal using setIsModalOpen
    setIsModalOpen(true);
    yield put(TeamActions.updateTeamSuccess({ teamId, updatedTeam }));
  } catch (error) { 
    console.error("Failed to handle update team success:", error);
  }
}

function* updateTeamFailureSaga(action: any) { 
  try {
    const { error } = action.payload;
    console.log(error)
    // Access the errorMessage state from the useModalFunctions hook
    const { setErrorMessage } = useModalFunctions();
    // Update the error message using setErrorMessage
    setErrorMessage(error);
    yield put(TeamActions.updateTeamFailure({ error: NOTIFICATION_MESSAGES.Team.UPDATE_TEAM_ERROR }));
    yield put(TeamActions.updateTeamFailure({ error: error }));
  } catch (error) {
    console.error("Failed to handle update team failure:", error);
  }
}

function* fetchTeamsSuccessSaga(action: any) { 
  try {
    const { teams } = action.payload;
    console.log(teams)
    // Access the methods and properties from the useModalFunctions hook
    const { setSuccessMessage, setIsModalOpen } = useModalFunctions();
    // Update the success message using setSuccessMessage
    setSuccessMessage(`Teams fetched successfully`);
    // Open the modal using setIsModalOpen
    setIsModalOpen(true);
    yield put(TeamActions.fetchTeamsSuccess({ teams }));
  } catch (error) {
    console.error("Failed to handle fetch teams success:", error);
  }
}


function* fetchTeamsFailureSaga(action: any) { 
  try {
    const { error } = action.payload;
    console.log(error)
    // Access the errorMessage state from the useModalFunctions hook
    const { setErrorMessage } = useModalFunctions();
    // Update the error message using setErrorMessage
    setErrorMessage(error);
    yield put(TeamActions.fetchTeamsFailure({ error: NOTIFICATION_MESSAGES.Team.FETCH_TEAMS_ERROR }));
    yield put(TeamActions.fetchTeamsFailure({ error: error }));
  } catch (error) {
    console.error("Failed to handle fetch teams failure:", error);
  }
}


// Watcher Saga: Watches for the fetch and update team actions
function* watchTeamSagas() {
  yield takeLatest(TeamActions.fetchTeamRequest.type, fetchTeamSaga);
  yield takeLatest(TeamActions.updateTeamRequest.type, updateTeamSaga);
  yield takeLatest(TeamActions.addTeam.type, addTeamSaga);
  yield takeLatest(TeamActions.removeTeam.type, removeTeamSaga);
  yield takeLatest(TeamActions.fetchTeamsRequest.type, fetchTeamsSaga);
  yield takeLatest(TeamActions.updateTeamsRequest.type, updateTeamsSaga);
  yield takeLatest(TeamActions.updateTeams.type, updateTeamsSaga);

  // Listen for add team success and failure actions
  yield takeLatest(TeamActions.addTeamSuccess.type, addTeamSuccessSaga);
  yield takeLatest(TeamActions.addTeamFailure.type, addTeamFailureSaga);


   // Listen for add team success and failure actions
   yield takeLatest(TeamActions.addTeamSuccess.type, addTeamSuccessSaga);
   yield takeLatest(TeamActions.addTeamFailure.type, addTeamFailureSaga);
  
  // Listen for remove team failure action
  yield takeLatest(TeamActions.removeTeamFailure.type, removeTeamFailureSaga);

  // Listen for fetch team success and failure actions
  yield takeLatest(TeamActions.fetchTeamSuccess.type, fetchTeamSuccessSaga);
  yield takeLatest(TeamActions.fetchTeamFailure.type, fetchTeamFailureSaga);

  // Listen for update team success and failure actions
  yield takeLatest(TeamActions.updateTeamSuccess.type, updateTeamSuccessSaga);
  yield takeLatest(TeamActions.updateTeamFailure.type, updateTeamFailureSaga);

  // Listen for fetch teams success and failure actions
  yield takeLatest(TeamActions.fetchTeamsSuccess.type, fetchTeamsSuccessSaga);
  yield takeLatest(TeamActions.fetchTeamsFailure.type, fetchTeamsFailureSaga);

  // Listen for update teams success and failure actions
  yield takeLatest(TeamActions.updateTeamsSuccess.type, updateTeamsSuccessSaga);
  yield takeLatest(TeamActions.updateTeamsFailure.type, updateTeamsFailureSaga);

  
  // Add more sagas for other team-related actions if needed
}

// Export the team sagas
export function* teamSagas() {
  yield watchTeamSagas();
}
