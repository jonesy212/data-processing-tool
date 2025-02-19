// Import necessary dependencies and constants
import useApiUserPreferences from '@/app/api/preferences/ApiUserPreferences';
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import { UserPreferences } from '@/app/configs/UserPreferences';
import { UserVisualPreferencesActions } from '@/app/configs/UserPreferencesActions';
import { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, takeLatest } from 'redux-saga/effects';





function* handleSetTheme(action: PayloadAction<string>) {
  try {
    // Logic to handle setting theme
    const { payload: theme } = action;
    yield call(useApiUserPreferences().setTheme, theme);
  } catch (error) {w
    console.error('Error setting theme:', error);
    // Dispatch an action to show error notification
    yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set theme.' });
  }
}
function* handleSetFontSize(action: PayloadAction<string>) { 
  try {
    // Logic to handle setting font size
    const { payload: fontSize } = action;
    yield call(useApiUserPreferences().setFontSize, fontSize);
  } catch (error) {
    console.error('Error setting font size:', error);
    // Dispatch an action to show error notification
    yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set font size.' });
  }
}

function* handleSetColorScheme(action: PayloadAction<string>) { 
  try {
    // Logic to handle setting color scheme
  } catch (error) {
    console.error('Error setting color scheme:', error);
    // Dispatch an action to show error notification
    yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set color scheme.' });
  }
}


// Define a function to render components based on user preferences
function* renderComponentsBasedOnPreferences(userPreferences: UserPreferences) {
  // Extract preferences from userPreferences object
  const { fontSize, colorScheme, fontStyles } = userPreferences;

  // Logic to render components based on preferences
  if (fontSize === "large") {
    // Dispatch an action to set font size to large
    yield put(UserVisualPreferencesActions.setFontSize("large"));
  }

  if (colorScheme === "dark") {
    // Dispatch an action to set color scheme to dark
    yield put(UserVisualPreferencesActions.setColorScheme("dark"));
  }

  // Additional logic based on other preferences...
}



// Worker Saga: Fetch User Preferences
function* fetchUserPreferencesSaga(): Generator<any, void, any> {
  try {
    // Call the API to fetch user preferences
    const userPreferences: UserPreferences = yield call(useApiUserPreferences().fetchUserPreferences); // Add the correct type for userPreferences
    // Dispatch an action to update the store with fetched user preferences
    // yield put(UserPreferencesActions.fetchUserPreferencesSuccess(userPreferences));
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    // Dispatch an action to show error notification
    yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to fetch user preferences.' });
  }
}


// Watcher Saga: Watches for user preferences actions
function* watchUserPreferencesActions() {
  yield all([
    takeLatest(UserVisualPreferencesActions.setTheme.type, handleSetTheme),
    takeLatest(UserVisualPreferencesActions.setDarkMode.type, handleSetDarkMode),
    takeLatest(UserVisualPreferencesActions.setFontSize.type, handleSetFontSize),
    takeLatest(UserVisualPreferencesActions.setColorScheme.type, handleSetColorScheme),
    takeLatest(UserVisualPreferencesActions.setLogoPreferences.type, handleSetLogoPreferences),
    takeLatest(UserVisualPreferencesActions.setIconPreferences.type, handleSetIconPreferences),
    takeLatest(UserVisualPreferencesActions.setBackgroundPreferences.type, handleSetBackgroundPreferences),
    takeLatest(UserVisualPreferencesActions.setAvatarPreferences.type, handleSetAvatarPreferences),
    takeLatest("FETCH_USER_PREFERENCES", fetchUserPreferencesSaga), // Action type should be provided here

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
