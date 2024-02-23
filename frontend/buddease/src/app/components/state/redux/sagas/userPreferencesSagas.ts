import { endpoints } from "@/app/api/ApiEndpoints";
import * as ApiUserPreferences from '@/app/api/ApiUserPreferences';
import axiosInstance from "@/app/api/axiosInstance";
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import { UserCommunicationPreferences } from "@/app/configs/UserPreferencesActions";
import { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, takeLatest } from 'redux-saga/effects';

// Sample Sagas for handling user preferences actions
function* handleSetTheme(action: PayloadAction<string>) {
  // Logic to handle setting theme
  const { payload: theme } = action;
  try {
    yield call(ApiUserPreferences.setTheme, theme);
  } catch (error) {
    yield put(
      UserCommunicationPreferences.setThemeFailure({
        error: NOTIFICATION_MESSAGES.UserPreferences.SET_THEME_ERROR,
      })
    );
  }
}

function* handleSetIdeationPhase(action: PayloadAction) {
  // Logic to handle setting ideation phase
  const { payload: ideationPhase } = action;
  try {
    yield call(ApiUserPreferences.setIdeationPhase, ideationPhase);
  } catch (error) {
    yield put(
      UserCommunicationPreferences.setIdeationPhaseFailure({
        error: NOTIFICATION_MESSAGES.UserPreferences.SET_IDEATION_PHASE_ERROR,
      })
    );
  }
}

// Worker Saga: Fetch User Preferences
function* fetchUserPreferencesSaga() {
  try {
    // Dispatch an action to indicate the start of fetching user preferences
    // yield put(UserPreferencesActions.fetchUserPreferencesRequest());
    
    // Call the API to fetch user preferences
    const userPreferences = yield call(ApiUserPreferences.fetchUserPreferences);

    // Dispatch an action to update the store with fetched user preferences
    // yield put(UserPreferencesActions.fetchUserPreferencesSuccess(userPreferences));
  } catch (error) {
    // Dispatch an action to handle fetch failure
    // yield put(UserPreferencesActions.fetchUserPreferencesFailure(error));
  }
}

// Sagas for Communication Preferences
function* enableAudioCommunicationSaga(action) {
  try {
    // API call to enable audio communication
    yield call(axiosInstance.post, endpoints.ENABLE_AUDIO_COMMUNICATION, action.payload);
    yield put({ type: UserPreferencesActions.ENABLE_AUDIO_COMMUNICATION_SUCCESS, payload: action.payload });
  } catch (error) {
    showToast("Error enabling audio communication");
    yield put({ type: UserPreferencesActions.ENABLE_AUDIO_COMMUNICATION_FAILURE, payload: error });
  }
}

function* enableVideoCommunicationSaga(action) {
  // Saga logic for enabling video communication...
}

// Other sagas for communication preferences...

// Sagas for Visual Preferences
function* setFontSizeSaga(action) {
  // Saga logic for setting font size...
}

function* setColorSchemeSaga(action) {
  // Saga logic for setting color scheme...
}

// Other sagas for visual preferences...

// Sagas for Data Management Preferences
function* setBackupPreferencesSaga(action) {
  // Saga logic for setting backup preferences...
}

function* setSyncPreferencesSaga(action) {
  // Saga logic for setting sync preferences...
}

// Other sagas for data management preferences...

// Watcher Saga: Watches for user preferences actions
function* watchUserPreferencesActions() {
  yield all([
    // Sample Sagas
    takeLatest(UserCommunicationPreferences.setTheme.type, handleSetTheme),
    takeLatest(UserCommunicationPreferences.setIdeationPhase.type, handleSetIdeationPhase),
    // Worker Saga
    takeLatest(UserPreferencesActions.FETCH_USER_PREFERENCES_REQUEST, fetchUserPreferencesSaga),
    // Communication Preferences sagas
    takeLatest(UserPreferencesActions.ENABLE_AUDIO_COMMUNICATION_REQUEST, enableAudioCommunicationSaga),
    takeLatest(UserPreferencesActions.ENABLE_VIDEO_COMMUNICATION_REQUEST, enableVideoCommunicationSaga),
    // Visual Preferences sagas
    takeLatest(UserPreferencesActions.SET_FONT_SIZE_REQUEST, setFontSizeSaga),
    takeLatest(UserPreferencesActions.SET_COLOR_SCHEME_REQUEST, setColorSchemeSaga),
    // Data Management Preferences sagas
    takeLatest(UserPreferencesActions.SET_BACKUP_PREFERENCES_REQUEST, setBackupPreferencesSaga),
    takeLatest(UserPreferencesActions.SET_SYNC_PREFERENCES_REQUEST, setSyncPreferencesSaga),
    // Add more watchers for other user preferences actions...
  ]);
}

// Root Saga
export default function* userPreferencesSagas() {
  yield all([
    watchUserPreferencesActions(),
    // Add more root sagas for other features...
  ]);
}
