// Import necessary dependencies and actions
import axios, { AxiosResponse } from "axios";
import { call, put, takeLatest } from "redux-saga/effects";
import { Project } from "../../../models/projects/Project";
import { ProjectActions } from "../../../projects/ProjectActions";
import NOTIFICATION_MESSAGES from "../../../support/NotificationMessages";

// Replace 'yourApiEndpoint' with the actual API endpoint
const fetchProjectsAPI = () => axios.get('/api/projects');

// Define saga functions similar to TaskSagas
// Example saga functions:

// Fetch projects saga
function* fetchProjectsSaga(): Generator {
  try {
    yield put(ProjectActions.fetchProjectsRequest());
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
  yield takeLatest(ProjectActions.fetchProjectsRequest.type, fetchProjectsSaga);
  // Add other sagas here...
}

// Root saga to combine and export all project sagas
export function* projectSagas() {
  yield watchProjectSagas();
  // Add other watcher sagas here if needed...
}
