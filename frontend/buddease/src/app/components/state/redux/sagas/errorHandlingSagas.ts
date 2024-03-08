import { ErrorHandlingActions } from '@/app/api/ErrorHandlingActions';
import { VideoActions } from '@/app/components/users/VideoActions';
import { put, takeEvery } from 'redux-saga/effects';
// Function to display a notification message
function notify(message: any) {
  // Implement your notification logic here
  console.log(message); // Placeholder for actual notification implementation
}

// Example usage of the notify function
notify("This is a notification message."); // Display a notification with the specified message


function* handleVideoError(action: any) {
  try {
    const { error } = action.payload;
    // Handle the error based on its type and dispatch appropriate actions
    // For example, you can display a notification or log the error
    yield put(ErrorHandlingActions.setError(error));
    notify(`Video error: ${error}`);
  } catch (error) {
    yield put(ErrorHandlingActions.setError("An error occurred while handling the video error."));
  }
}

function* handleNotificationError(action: any) {
  try {
    const { error } = action.payload;
    // Handle the error and dispatch appropriate actions
    // For example, you can log the error or display a different notification
    yield put(ErrorHandlingActions.setError(error));
    notify(`Notification error: ${error}`);
  } catch (error) {
    yield put(ErrorHandlingActions.setError("An error occurred while handling the notification error."));
  }
}

// Define additional error handling sagas as needed
function* handleOtherError(action: any) {
  try {
    const { error } = action.payload;
    // Handle the error and dispatch appropriate actions
    // For example, you can log the error or perform specific error handling logic
    yield put(ErrorHandlingActions.setError(error));
    notify(`Other error: ${error}`);
  } catch (error) {
    yield put(ErrorHandlingActions.setError("An error occurred while handling another error."));
  }
}

// Function to clear error
function* clearError() {
  try {
    yield put(ErrorHandlingActions.clearError());
  } catch (error) {
    console.error("An error occurred while clearing error:", error);
  }
}

// Watcher Saga: Watches for error actions
export function* watchErrorActions() {
  // yield takeEvery(VideoActions.fetchVideoFailure.type, handleVideoError);
  yield takeEvery(ErrorHandlingActions.handleNotificationError.type, handleNotificationError); // Using the action creator from ErrorHandlingActions
  yield takeEvery(ErrorHandlingActions.handleOtherError.type, handleOtherError); // Using the action creator from ErrorHandlingActions
  yield takeEvery(ErrorHandlingActions.clearError.type, clearError); // Watch for clearError action
}
