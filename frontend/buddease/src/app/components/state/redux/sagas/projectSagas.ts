// Import necessary dependencies and actions
import { ProjectActions } from "@/app/components/actions/ProjectActions";
import { Project } from "@/app/components/projects/Project";
import axios, { AxiosResponse } from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import NOTIFICATION_MESSAGES from "../../../support/NotificationMessages";

// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchProjectsAPI = () => axios.get('/api/projects');

// Define saga functions similar to TaskSagas
// Example saga functions:

// Fetch projects saga
function* fetchProjectsSaga(): Generator {
  try {
    yield put(ProjectActions.fetchProjectsRequest(payload));
    const response: AxiosResponse<Project[]> = yield call(fetchProjectsAPI);
    yield put(ProjectActions.fetchProjectsSuccess({ projects: response.data }));
  } catch (error) {
    yield put(
      ProjectActions.fetchProjectsFailure({
        error: NOTIFICATION_MESSAGES.Projects.PROJECT_FETCH_ERROR,
      })
    );
  }
}

// Add other saga functions as needed

// Watcher saga to listen for actions and call corresponding sagas
export function* watchProjectSagas() {
  // Fetch projects and tasks
  yield takeLatest(ProjectActions.fetchProjectsRequest.type, fetchProjectsSaga);
  yield takeLatest(ProjectActions.fetchProjectTasksRequest.type, fetchProjectTasksSaga);

  // CRUD operations on projects
  yield takeLatest(ProjectActions.add.type, addProjectSaga);
  yield takeLatest(ProjectActions.remove.type, removeProjectSaga);
  yield takeLatest(ProjectActions.updateTitle.type, updateProjectTitleSaga);
  yield takeLatest(ProjectActions.updateProjectSuccess.type, updateProjectSuccessSaga);
  yield takeLatest(ProjectActions.updateProjectFailure.type, updateProjectFailureSaga);
  yield takeLatest(ProjectActions.deleteProjectSuccess.type, deleteProjectSuccessSaga);
  yield takeLatest(ProjectActions.deleteProjectFailure.type, deleteProjectFailureSaga);
  yield takeLatest(ProjectActions.createProjectSuccess.type, createProjectSuccessSaga);
  yield takeLatest(ProjectActions.createProjectFailure.type, createProjectFailureSaga);

  // Fetching project details and batches
  yield takeLatest(ProjectActions.fetchProjectSuccess.type, fetchProjectSuccessSaga);
  yield takeLatest(ProjectActions.fetchProjectsSuccess.type, fetchProjectsSuccessSaga);
  yield takeLatest(ProjectActions.fetchProjectFailure.type, fetchProjectFailureSaga);
  yield takeLatest(ProjectActions.fetchProjectsFailure.type, fetchProjectsFailureSaga);
  yield takeLatest(ProjectActions.batchFetchProjectsRequest.type, batchFetchProjectsRequestSaga);
  yield takeLatest(ProjectActions.batchFetchProjectsSuccess.type, batchFetchProjectsSuccessSaga);
  yield takeLatest(ProjectActions.batchFetchProjectsFailure.type, batchFetchProjectsFailureSaga);

  // Batch update and remove operations
  yield takeLatest(ProjectActions.batchUpdateProjectsRequest.type, batchUpdateProjectsRequestSaga);
  yield takeLatest(ProjectActions.batchUpdateProjectsSuccess.type, batchUpdateProjectsSuccessSaga);
  yield takeLatest(ProjectActions.batchUpdateProjectsFailure.type, batchUpdateProjectsFailureSaga);
  yield takeLatest(ProjectActions.batchRemoveProjectsRequest.type, batchRemoveProjectsRequestSaga);
  yield takeLatest(ProjectActions.batchRemoveProjectsSuccess.type, batchRemoveProjectsSuccessSaga);
  yield takeLatest(ProjectActions.batchRemoveProjectsFailure.type, batchRemoveProjectsFailureSaga);

  // Additional project-related actions
  // Add other sagas for remaining actions...
}


// Root saga to combine and export all project sagas
export function* projectSagas() {
  yield watchProjectSagas();
  // Add other watcher sagas here if needed...
}
