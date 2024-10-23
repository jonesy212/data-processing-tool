// Import necessary dependencies and constants
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { UserVisualPreferencesActions } from "@/app/configs/UserPreferencesActions";
import { ThemeService } from "@/app/libraries/theme/ThemeService";
import { PayloadAction } from "@reduxjs/toolkit";
import { all, put, takeLatest } from "redux-saga/effects";
import { fetchUserPreferencesSaga } from "./userPreferencesSagaManager";

function* handleSetFontSize(action: PayloadAction<string>) {
  try {
    const { payload: fontSize } = action;
    // Logic to handle setting font size
    ThemeService.setFontSize(fontSize);
  } catch (error) {
    console.error("Error setting font size:", error);
    // Dispatch an action to show error notification
    yield put({
      type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR,
      payload: "Failed to set font size.",
    });
  }
}

function* handleSetColorScheme(action: PayloadAction<string>) {
  try {
    // Logic to handle setting color scheme
  } catch (error) {
    console.error("Error setting color scheme:", error);
    // Dispatch an action to show error notification
    yield put({
      type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR,
      payload: "Failed to set color scheme.",
    });
  }
}

// Sample Saga for handling setting theme
function* handleSetTheme(action: PayloadAction<string>) {
  try {
    const themeColor = action.payload; // Assuming the payload contains the theme color
    const logoUrl = "logoUrl"; // Assuming the payload contains the logo URL

    // Apply the theme color and logo URL using ThemeService
    ThemeService.getInstance().applyTheme({
      themeColor: themeColor,
      logoUrl: logoUrl,
    });

    // Dispatch an action to indicate that the theme has been successfully updated
    yield put({
      type: "THEME_UPDATED_SUCCESSFULLY",
      payload: { themeColor, logoUrl },
    });
  } catch (error) {
    console.error("Error setting theme:", error);
    // Dispatch an action to show error notification
    yield put({
      type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR,
      payload: "Failed to set theme.",
    });
  }
}
// Watcher Saga: Watches for user preferences actions
function* watchUserPreferencesActions() {
  yield all([
    takeLatest(
      UserVisualPreferencesActions.setFontSize.type,
      handleSetFontSize
    ),
    takeLatest(
      UserVisualPreferencesActions.setColorScheme.type,
      handleSetColorScheme
    ),
    takeLatest(UserVisualPreferencesActions.setTheme.type, handleSetTheme),

    takeLatest("FETCH_USER_PREFERENCES", fetchUserPreferencesSaga), // Action type should be provided here

    // Add more watchers for other user preferences actions...
  ]);
}

// Root Saga
export default function* visualPreferencesSaga() {
  yield all([
    watchUserPreferencesActions(),

    // Add more root sagas for other features...
  ]);
}
