import * as UserRolesApi from "@/api/ApiUserRole";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { UserRoleActions } from "@/app/components/users/UserRoleActions";
import { call, put, takeLatest } from "redux-saga/effects";

// Worker saga for fetching user roles
function* fetchUserRolesSaga(): Generator<any, void, any> {
  try {
    const fetchedUserRoles = yield call(UserRolesApi.fetchUserRoles); // Assuming fetchUserRoles is a function that fetches user roles from the API
    yield put(UserRoleActions.fetchUserRolesSuccess({ userRoles: fetchedUserRoles }));
  } catch (error) {
    // Use NOTIFICATION_MESSAGES to provide more descriptive error messages
    const errorMessage = NOTIFICATION_MESSAGES.Error.DEFAULT('error');
    yield put(UserRoleActions.fetchUserRolesFailure({ error: errorMessage }));
  }
}

// Worker saga for updating user role
function* updateUserRoleSaga(action: ReturnType<typeof UserRoleActions.updateUserRoleRequest>) {
  try {
    const { id, newRole } = action.payload;
    yield call(UserRolesApi.updateUserRole, id, newRole); // Assuming updateUserRole is a function that updates a user role in the API
    yield put(UserRoleActions.updateUserRoleSuccess({ userRole: newRole }));
  } catch (error) {
    // Use NOTIFICATION_MESSAGES to provide more descriptive error messages
    const errorMessage = NOTIFICATION_MESSAGES.Error.DEFAULT('error');
    yield put(UserRoleActions.updateUserRoleFailure({ error: errorMessage }));
  }
}

// Worker saga for removing user role
function* removeUserRoleSaga(action: ReturnType<typeof UserRoleActions.removeUserRoleRequest>) {
  try {
    const id = action.payload;
    yield call(UserRolesApi.removeUserRoleSaga, id); // Assuming removeUserRole is a function that removes a user role in the API
    yield put(UserRoleActions.removeUserRoleSuccess(id));
  } catch (error) {
    // Use NOTIFICATION_MESSAGES to provide more descriptive error messages
    const errorMessage = NOTIFICATION_MESSAGES.Error.DEFAULT('error');
    yield put(UserRoleActions.removeUserRoleFailure({ error: errorMessage }));
  }
}

// Watcher saga to listen for fetch, update, and remove user role actions
export function* userRoleSaga() {
  yield takeLatest(UserRoleActions.fetchUserRolesRequest.type, fetchUserRolesSaga);
  yield takeLatest(UserRoleActions.updateUserRoleRequest.type, updateUserRoleSaga);
  yield takeLatest(UserRoleActions.removeUserRoleRequest.type, removeUserRoleSaga);
  // Add more sagas for batch actions if needed
}
