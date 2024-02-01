// userRoleSagas.ts
import * as UserRolesApi from "@/api/ApiUserRole";
import { call, put, takeLatest } from "redux-saga/effects";

// Worker saga for fetching user roles
function* fetchUserRolesSaga() {
  try {
    const userRoles = yield call(UserRolesApi.fetchUserRoles); // Assuming fetchUserRoles is a function that fetches user roles from the API
    yield put(UserRoleActions.fetchUserRolesSuccess({ userRoles }));
  } catch (error) {
    yield put(UserRoleActions.fetchUserRolesFailure({ error: error.message }));
  }
}

// Worker saga for updating user role
function* updateUserRoleSaga(action: ReturnType<typeof UserRoleActions.updateUserRoleRequest>) {
  try {
    const { id, newRole } = action.payload;
    yield call(UserRolesApi.updateUserRole, id, newRole); // Assuming updateUserRole is a function that updates a user role in the API
    yield put(UserRoleActions.updateUserRoleSuccess({ userRole: newRole }));
  } catch (error) {
    yield put(UserRoleActions.updateUserRoleFailure({ error: error.message }));
  }
}

// Worker saga for removing user role
function* removeUserRoleSaga(action: ReturnType<typeof UserRoleActions.removeUserRoleRequest>) {
  try {
    const id = action.payload;
    yield call(UserRolesApi.removeUserRole, id); // Assuming removeUserRole is a function that removes a user role in the API
    yield put(UserRoleActions.removeUserRoleSuccess(id));
  } catch (error) {
    yield put(UserRoleActions.removeUserRoleFailure({ error: error.message }));
  }
}

// Watcher saga to listen for fetch, update, and remove user role actions
export function* userRoleSaga() {
  yield takeLatest(UserRoleActions.fetchUserRolesRequest.type, fetchUserRolesSaga);
  yield takeLatest(UserRoleActions.updateUserRoleRequest.type, updateUserRoleSaga);
  yield takeLatest(UserRoleActions.removeUserRoleRequest.type, removeUserRoleSaga);
  // Add more sagas for batch actions if needed
}
