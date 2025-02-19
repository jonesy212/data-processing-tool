import { addPhase, fetchPhases, removePhase, updatePhase } from "@/app/api/ApiPhases";
import { IdeationPhaseActions } from "@/app/components/phases/actions/IdeationPhaseActions";
import { all, call, put, takeLatest } from "redux-saga/effects";

// Worker saga for handling actions related to Ideation Phase
function* handleIdeationPhaseActions(action: any): Generator<any, void, any> {
  try {
    const { payload } = action;

    switch (action.type) {
      case IdeationPhaseActions.updateIdeationPhase.type:
        yield call(updatePhase, payload.id, payload.newData);
        break;
      case IdeationPhaseActions.deleteIdeationPhase.type:
        yield call(removePhase, payload);
        break;
      case IdeationPhaseActions.updateIdeationPhaseMetadata.type:
        // Implement logic to update ideation phase metadata
        break;
      case IdeationPhaseActions.fetchIdeationPhaseRequest.type:
        const phases = yield call(fetchPhases);
        yield put({ type: IdeationPhaseActions.fetchIdeationPhaseSuccess.type, payload: { phases } });
        break;
      case IdeationPhaseActions.addPhase.type:
        yield call(addPhase, payload);
        break;
      // Handle other action types similarly
      default:
        break;
    }

    // If needed, dispatch success action
    yield put({ type: IdeationPhaseActions.fetchIdeationPhaseSuccess.type });

  } catch (error: any) {
    // If an error occurs, dispatch failure action
    yield put({ type: IdeationPhaseActions.fetchIdeationPhaseFailure.type, payload: error.message });
  }
}

// Watcher saga to listen for actions related to Ideation Phase
export function* watchIdeationPhase() {
  yield all([
    takeLatest(IdeationPhaseActions.updateIdeationPhase.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.deleteIdeationPhase.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseMetadata.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.sendIdeationPhaseNotification.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseData.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.fetchIdeationPhaseSuccess.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.fetchIdeationPhaseFailure.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.fetchIdeationPhaseRequest.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.shareIdeationPhase.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.analyzeIdeationPhase.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.recommendIdeationPhase.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.subscribeToIdeationPhase.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.unsubscribeFromIdeationPhase.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseThumbnail.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseTitle.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseDescription.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseTags.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseLanguage.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseCategory.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseResolution.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseLicense.type, handleIdeationPhaseActions),
    takeLatest(IdeationPhaseActions.updateIdeationPhaseLocation.type, handleIdeationPhaseActions),
    // Add more action types as needed
  ]);
}
