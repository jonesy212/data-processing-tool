// ThemeSettingsSagas.ts
import { ThemeActions } from "@/core/actions/ThemeActions";
import { ValidationActionTypes, ValidationActions, validationSuccess } from "@/core/actions/ValidationActions";
import { handleApiErrorAndNotify } from "@/core/api/ApiData";
import NOTIFICATION_MESSAGES from "@/core/features/support/NotificationMessages";
import { Theme } from "@/core/libraries/ui/theme/Theme";
import Logger from '@/core/logging/Logger';
import ThemeValidator from "@/core/server/security/validateTheme";
import { PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { call, put, takeLatest } from "redux-saga/effects";


const dispatch = useDispatch()
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))




// Create theme-specific error handler
const handleThemeApiErrorAndNotify = (
  error: any,
  defaultMessage: string,
  errorId: keyof typeof NOTIFICATION_MESSAGES.Theme
) => {
  return handleApiErrorAndNotify(
    error,
    defaultMessage,
    errorId,
    NOTIFICATION_MESSAGES.Theme
  );
};



// Then use it in your sagas
// ThemeSettingsSagas.ts
import { showThemeErrorNotification, showThemeSuccessNotification } from '@/core/state/redux/sagas/ThemeNotificationHelpers';

function* setHeaderColor(action: PayloadAction<Theme>) {
  try {
    yield put({
      type: ThemeActions.setHeaderColor.type,
      payload: action.payload,
    });
    
    const notificationInstance = showThemeSuccessNotification(
      NOTIFICATION_MESSAGES.Theme.HEADER_COLOR_CHANGED
    );
    
    yield delay(3000);
    notificationInstance.remove();
    yield put(ThemeActions.setHeaderColorSuccess());
    
  } catch (error: any) {
    Logger.error("Error setting header color", error);
    yield put({
      type: ThemeActions.setHeaderColorFailure.type,
      error: error.message,
    });
    
    const notificationInstance = showThemeErrorNotification(
      error,
      "Failed to set header color"
    );
    
    yield delay(3000);
    notificationInstance.remove();
  }
}

function* setFooterColor(action: PayloadAction<Theme>) {
  try {
    yield put({
      type: ThemeActions.setFooterColor.type,
      payload: action.payload
    });

    const notificationInstance = showThemeSuccessNotification(
      NOTIFICATION_MESSAGES.Theme.FOOTER_COLOR_CHANGED
    );

    yield delay(3000);
    notificationInstance.remove();
    yield put(ThemeActions.setFooterColorSuccess());

  } catch (error: any) {
    Logger.error("Error setting footer color", error);
    yield put({
      type: ThemeActions.setFooterColorFailure.type,
      error: error.message
    });

    const notificationInstance = showThemeErrorNotification(
      error,
      "Failed to set footer color"
    );

    yield delay(3000);
    notificationInstance.remove();
  }
}

// Saga function for validating theme settings
function* validateThemeSettings(action: PayloadAction<Partial<Theme>>) {
  try {
    // Validate theme settings
    const validationErrors = ThemeValidator.validateTheme(action.payload);

    // If there are validation errors, dispatch a failure action
    if (validationErrors.length > 0) {
      yield put(
        ValidationActions.validationFailure(validationErrors.join(","))
      );
    } else {
      // If theme settings are valid, dispatch a success action
      yield put(validationSuccess());
      yield put(ValidationActions.saveThemeSettings(action.payload)); // dispatch action to save valid settings
    }
  } catch (error) {
    // If an error occurs during validation, dispatch a failure action with an error message
    yield put(
      ValidationActions.validationFailure({
        error: NOTIFICATION_MESSAGES.Tasks.TASK_VALIDATION_ERROR,
      })

    );
    yield call(Logger.logError, "An error occurred during data validation.");
  }
}
 
// Watcher saga for theme validation
function* watchThemeValidationActions() {
  yield takeLatest(
    ValidationActionTypes.VALIDATE_THEME_SETTINGS,
    validateThemeSettings
  );

  // Additional actions from ThemeCustomizationProps
  // Header, Footer, Body, Border
  yield takeLatest(
    ThemeActions.setHeaderColor.type,
    setHeaderColor
  );
  yield takeLatest(
    ThemeActions.setFooterColor.type,
    setFooterColor)

  yield takeLatest(ThemeActions.setBodyColor, setBodyColor)
  yield takeLatest(
    ThemeActions.setBorderColor,
    setBorderColor
  );
  // Border Width, Border Style
  yield takeLatest(
    ThemeActions.setBorderWidth.type,
    setBorderWidth
  );
  yield takeLatest(
    ThemeActions.setBorderStyle,
    setBorderStyle)
  
  // Padding, Margin
  yield takeLatest(ThemeActions.setPadding, setPadding)
  yield takeLatest(ThemeActions.setMargin, setMargin)
  // Brand Icon, Brand Name
  yield takeLatest(ThemeActions.setBrandIcon, setBrandIcon)
  yield takeLatest(ThemeActions.setBrandName, setBrandName)

  // Theme Configuration
  yield takeLatest(ThemeActions.updateTheme, updateTheme)
  yield takeLatest(ThemeActions.resetTheme, resetTheme)
  yield takeLatest(
    ThemeActions.toggleDarkMode,
    toggleDarkMode)
  
  yield takeLatest(
    ThemeActions.setPrimaryColor,
    setPrimaryColor)
  
  yield takeLatest(
    ThemeActions.setSecondaryColor,
    setSecondaryColor)
  
  yield takeLatest(ThemeActions.setFontSize, setFontSize)
  yield takeLatest(ThemeActions.setFontFamily, setFontFamily)
  yield takeLatest(
    ThemeActions.applyThemeConfig,
    applyThemeConfig)
  

  // Customization
  yield takeLatest(
    ThemeActions.customizeThemeProperties,
    customizeThemeProperties)
  

  // Theme Management
  yield takeLatest(ThemeActions.switchTheme, switchTheme)
  yield takeLatest(
    ThemeActions.localizeThemeSettings,
    localizeThemeSettings)
  
  yield takeLatest(
    ThemeActions.handleThemeEvents,
    handleThemeEvents)
 
  yield takeLatest(
    ThemeActions.documentThemeSettings,
    documentThemeSettings)
 

  // Optimization and Performance
  yield takeLatest(
    ThemeActions.optimizeThemePerformance,
    optimizeThemePerformance)
 
  yield takeLatest(
    ThemeActions.analyzeThemeUsage,
    analyzeThemeUsage)
 
  yield takeLatest(
    ThemeActions.visualizeThemeMetrics,
    visualizeThemeMetrics)
 

  // Security and Governance
  yield takeLatest(
    ThemeActions.secureThemeSettings,
    secureThemeSettings)
 
  yield takeLatest(
    ThemeActions.governThemeGovernance,
    governThemeGovernance)
 
  yield takeLatest(
    ThemeActions.auditThemeCompliance,
    auditThemeCompliance)
 
}

export function* themeValidation() {
    yield watchThemeValidationActions()
}