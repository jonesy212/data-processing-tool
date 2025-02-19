// freelancerSaga.ts
import { call, put, takeLatest } from "redux-saga/effects";
import { FreelancerActions } from "../actions/FreelancerActions";
import { freelancerApiService } from "@/app/components/models/FreelancerService";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";

// Worker Saga: Submit Project Proposal
function* submitProjectProposalSaga(action: any) {
  try {
    const proposalData = action.payload;
    yield call(freelancerApiService.submitProjectProposal, proposalData); // Adjust the service method accordingly
    yield put(FreelancerActions.submitProjectProposalSuccess());
  } catch (error) {
    yield put(
      FreelancerActions.submitProjectProposalFailure({
        error: NOTIFICATION_MESSAGES.Freelancer.SUBMIT_PROPOSAL_ERROR,
      })
    );
  }
}

// Worker Saga: Join Project
function* joinProjectSaga(action: any) {
  try {
    const projectId = action.payload;
    yield call(freelancerApiService.joinProject, projectId); // Adjust the service method accordingly
    yield put(FreelancerActions.joinProjectSuccess());
  } catch (error) {
    yield put(
      FreelancerActions.joinProjectFailure({
        error: NOTIFICATION_MESSAGES.Freelancer.JOIN_PROJECT_ERROR,
      })
    );
  }
}

// Watcher Saga: Watches for the submit project proposal and join project actions
function* watchFreelancerSaga() {
  yield takeLatest(FreelancerActions.submitProjectProposalRequest.type, submitProjectProposalSaga);
  yield takeLatest(FreelancerActions.joinProjectRequest.type, joinProjectSaga);
}

// Export the freelancer saga
export function* freelancerSaga() {
  yield watchFreelancerSaga();
}
