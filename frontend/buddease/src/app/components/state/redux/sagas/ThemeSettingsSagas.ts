// ThemeSettingsSagas.ts
import { handleApiErrorAndNotify } from "@/app/api/ApiData";
import { ThemeActions } from "@/app/components/actions/ThemeActions";
import { Theme } from "@/app/components/libraries/ui/theme/Theme";
import Logger from "@/app/components/logging/Logger";
import { ValidationActionTypes, ValidationActions, validationSuccess } from "@/app/components/security/ValidationActions";
import ThemeValidator from "@/app/components/security/validateTheme";
import { useNotification } from "@/app/components/support/NotificationContext";
import NOTIFICATION_MESSAGES from "@/app/components/support/NotificationMessages";
import { PayloadAction } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { call, put, takeLatest } from "redux-saga/effects";


const {notify} = handleApiErrorAndNotify()
const dispatch = useDispatch()
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))



function* setHeaderColor(action: PayloadAction<Theme>) {
  try {
    yield put({
      type: ThemeActions.setHeaderColor.type,
      payload: action.payload,
    });
    const notificationInstance = notify({
      type: "success",
      message: NOTIFICATION_MESSAGES.THEME.HEADER_COLOR_CHANGED,
    });
    yield delay(3000);
    notificationInstance.remove();
    yield put(ThemeActions.setHeaderColorSuccess());
  } catch (error: any) {
    Logger.error("Error setting header color", error);
    yield put({
      type: ThemeActions.setHeaderColorFailure.type,
      error: error.message,
    });
    const notificationInstance = notify({
      type: "error",
      message: error.message,
    });
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

    const notificationInstance = notify({
      type: "success",
      message: NOTIFICATION_MESSAGES.THEME.FOOTER_COLOR_CHANGED
    });

    yield delay(3000);
    notificationInstance.remove();
    yield put(ThemeActions.setFooterColorSuccess());

  } catch (error: any) {
    Logger.error("Error setting footer color", error);
    yield put({
      type: ThemeActions.setFooterColorFailure.type,
      error: error.message
    });

    const notificationInstance = notify({
      type: "error",
      message: error.message
    });

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