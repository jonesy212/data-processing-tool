import { endpoints } from "@/app/api/ApiEndpoints";
import { endpointPreferences } from "@/app/api/ApiPreferencesEndpoints";
import axiosInstance from "@/app/api/axiosInstance";
import useApiUserPreferences from "@/app/api/preferences/ApiUserPreferences";
import { showToast } from "@/app/components/models/display/ShowToast";
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import { UserBrandingPreferencesActions, UserCommunicationPreferencesActions, UserPreferencesActions } from "@/app/configs/UserPreferencesActions";
import { Message } from '@/app/generators/GenerateChatInterfaces';
import { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, takeLatest } from 'redux-saga/effects';

const API_PREFERENCES_URL = endpointPreferences.userPreferences;
// Sample Sagas for handling user preferences actions
function* handleSetTheme(action: PayloadAction<string>) {
  // Logic to handle setting theme
  const { payload: theme } = action;
  try {
    yield call(useApiUserPreferences().setTheme, theme);
  } catch (error) {
    yield put(
      UserBrandingPreferencesActions.setThemeFailure({
        error: NOTIFICATION_MESSAGES.Theme.DEFAULT
      })
    );
  }
}

function* handleSetIdeationPhase(action: PayloadAction<any>) {
  // Logic to handle setting ideation phase
  const { payload: ideationPhase } = action;
  try {
    yield call(useApiUserPreferences().setIdeationPhase, ideationPhase);
  } catch (error) {
    yield put(
      UserCommunicationPreferencesActions.setIdeationPhaseFailure({
        error: NOTIFICATION_MESSAGES.UserPreferences.SET_IDEATION_PHASE_ERROR,
      })
    );
  }
}

// Worker Saga: Fetch User Preferences
function* fetchUserPreferencesSaga(): Generator<any, void, any> {
  try {
    // Dispatch an action to indicate the start of fetching user preferences
    yield put(UserPreferencesActions.fetchUserPreferencesRequest());
    
    // Call the API to fetch user preferences
    const userPreferences: any = yield call(useApiUserPreferences().fetchUserPreferences);

    // Dispatch an action to update the store with fetched user preferences
    yield put(UserPreferencesActions.fetchUserPreferencesSuccess({ userPreferences }));
  } catch (error) {
    // Dispatch an action to handle fetch failure
    yield put(UserPreferencesActions.fetchUserPreferencesFailure({
      error: NOTIFICATION_MESSAGES.UserPreferences.FETCH_THEME_FAILURE
    }));
  }
}


// Sagas for Communication Preferences
function* enableAudioCommunicationSaga(action: PayloadAction<any>) {
  try {
    // API call to enable audio communication
    yield call(axiosInstance.post, endpoints.communication.audioCall, action.payload);
    yield put(UserCommunicationPreferencesActions.enableAudioCommunicationSuccess({ payload: action.payload }));
  } catch (error) {
    const content= {} as  Message
    showToast(content);
    yield put(UserPreferencesActions.enableAudioCommunicationFailure({error:NOTIFICATION_MESSAGES.Audio.AudioCommunicationFailure}));
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
      takeLatest(UserCommunicationPreferencesActions.setTheme.type, handleSetTheme),
      takeLatest(UserCommunicationPreferencesActions.setIdeationPhase.type, handleSetIdeationPhase),
      
      // Worker Saga fetchuserpreferencesrequest
      takeLatest(UserPreferencesActions.fetchUserPreferencesRequest, fetchUserPreferencesSaga),
      
      // Communication Preferences sagas
      takeLatest(UserCommunicationPreferencesActions.enableAudioCommunication.type, enableAudioCommunicationSaga), // Updated action type
      takeLatest(UserCommunicationPreferencesActions.enableVideoCommunicationRequest.type, enableVideoCommunicationSaga), // Updated action type
      
      // Visual Preferences sagas
      takeLatest(UserPreferencesActions.setFontSizeRequest.type, setFontSizeSaga),
      takeLatest(UserPreferencesActions.setColorSchemeRequest.type, setColorSchemeSaga),
      
      // Data Management Preferences sagas
      takeLatest(UserPreferencesActions.SET_BACKUP_PREFERENCES_REQUEST.type, setBackupPreferencesSaga),
      takeLatest(UserPreferencesActions.SET_SYNC_PREFERENCES_REQUEST.type, setSyncPreferencesSaga),
    
      takeLatest("FETCH_USER_PREFERENCES", fetchUserPreferencesSaga), // Action type should be provided here
  
   ]);
}

// Root Saga
export default function* userPreferencesSagas() {
  yield all([
    watchUserPreferencesActions(),
    // Add more root sagas for other features...
  ]);
}
