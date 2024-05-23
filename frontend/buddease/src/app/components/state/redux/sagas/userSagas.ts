// userSaga.ts
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import UserService, { userService } from "@/app/components/users/ApiUser";
import { User } from "@/app/components/users/User";
import { UserActions } from "@/app/components/users/UserActions";
import { call, put, takeLatest } from "redux-saga/effects";

// Worker Saga: Fetch User
function* fetchUserSaga(action: any) {
  try {
    const userId = action.payload;
    const user: User = yield call(UserService.fetchUser, userId, ''); // Add an empty string as the second argument for authToken
    yield put(UserActions.fetchUserSuccess({ user }));
  } catch (error) {
    yield put(
      UserActions.fetchUserFailure({
        error: NOTIFICATION_MESSAGES.User.FETCH_USER_ERROR,
      })
    );
  }
}

function* updateUserFailureSaga(action: any): Generator {
  try {
    // handle failure
    const error = action.payload.error;

    // You might want to dispatch a failure action to update the state or show a notification
    yield put({
      type: "SHOW_NOTIFICATION", // Replace with a valid action type for notifications
      payload: {
        message: `Error updating user: ${error}`,
        type: "error",
      },
    });
  } catch (error) {
    console.error("Failed to handle update user failure", error);
  }
}
// Worker Saga: Update User
function* updateUserSaga(action: any) {
  try {
    const { userId, userData } = action.payload;
    const updatedUser: User = yield call(
      userService.updateUser,
      userId,
      userData
    ); // Adjust the service method accordingly
    yield put(UserActions.updateUserSuccess({ user: updatedUser }));
  } catch (error) {
    yield put(
      UserActions.updateUserFailure({
        error: NOTIFICATION_MESSAGES.User.UPDATE_USER_ERROR,
      })
    );
  }
}

function* updateUsersRequestSaga(
  action: ReturnType<typeof UserActions.updateUsersRequest>
): Generator {
  try {
    const { updatedUsersData } = action.payload;
    const response = yield call(userService.updateUsers, updatedUsersData);
    yield put(UserActions.updateUsersSuccess({ users: response as User[] }));
  } catch (error) {
    // Handle error
    console.error("Error updating users:", error);

    // You might want to dispatch a failure action to update the state or show a notification
    yield put(
      UserActions.updateUsersFailure({ error: "Failed to update users" })
    );
  }
}



function* updateUsersFailureSaga(
  action: ReturnType<typeof UserActions.updateUsersFailure>
): Generator {
  try {
    // Handle the failure action
    const { error } = action.payload;

    // For example, you might want to show a notification to the user
    yield put({
      type: "SHOW_NOTIFICATION", // Replace NotificationActions with a valid action type
      payload: {
        message: `Failed to update users: ${error}`,
        type: "error",
      },
    });

    // For now, let's just log the error
    console.error("Update Users Failure:", error);
  } catch (error) {
    // Handle errors if necessary
    console.error("Error in updateUsersFailureSaga:", error);
  }
}

// Watcher Saga: Watches for the fetch and update user actions
function* watchUserSagas() {
  
  yield takeLatest(UserActions.fetchUserRequest.type, fetchUserSaga);
  yield takeLatest(UserActions.updateUserRequest.type, updateUserSaga);
  yield takeLatest(UserActions.updateUserFailure.type, updateUserFailureSaga);
  yield takeLatest(UserActions.updateUsersRequest.type, updateUsersRequestSaga);
  yield takeLatest(UserActions.updateUsersFailure.type, updateUsersFailureSaga);
}

// Export the user saga
export function* userSagas() {
  yield watchUserSagas();
}
