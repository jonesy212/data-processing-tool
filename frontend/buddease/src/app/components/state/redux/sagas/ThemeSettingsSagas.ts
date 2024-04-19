// ThemeSettingsSagas.ts
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


const {notify} = useNotification()
const dispatch = useDispatch()



function* setHeaderColor(action: PayloadAction<Theme>) {
  try {
    yield put({
      type: ThemeActions.setHeaderColor.type,
      payload: action.payload,
    });
    const notificationInstance = notify({
      type: "success",
      message: NOTIFICATION_MESSAGES.THEME.HEADER_COLOR_CHANGED,
    })[0];
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
    })[0];
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

export function* sagaFunctionFor(action: PayloadAction<string>) {
  try {
    yield put(validationSuccess());
    yield put(ValidationActions.saveThemeSettings(action.payload));
  } catch (error) {
    yield put(
      ValidationActions.validationFailure({
        error: NOTIFICATION_MESSAGES.Tasks.TASK_VALIDATION_ERROR,
      })
    )
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
    sagaFunctionFor(setHeaderColor)
  );
  yield takeLatest(
    ThemeActions.setFooterColor,
    sagaFunctionFor(setFooterColor)
  );
  yield takeLatest(ThemeActions.setBodyColor, sagaFunctionFor(setBodyColor));
  yield takeLatest(
    ThemeActions.setBorderColor,
    sagaFunctionFor(setBorderColor)
  );
  // Border Width, Border Style
  yield takeLatest(
    ThemeActions.setBorderWidth,
    sagaFunctionFor(setBorderWidth)
  );
  yield takeLatest(
    ThemeActions.setBorderStyle,
    sagaFunctionFor(setBorderStyle)
  );
  // Padding, Margin
  yield takeLatest(ThemeActions.setPadding, sagaFunctionFor(setPadding));
  yield takeLatest(ThemeActions.setMargin, sagaFunctionFor(setMargin));
  // Brand Icon, Brand Name
  yield takeLatest(ThemeActions.setBrandIcon, sagaFunctionFor(setBrandIcon));
  yield takeLatest(ThemeActions.setBrandName, sagaFunctionFor(setBrandName));

  // Theme Configuration
  yield takeLatest(ThemeActions.updateTheme, sagaFunctionFor(updateTheme));
  yield takeLatest(ThemeActions.resetTheme, sagaFunctionFor(resetTheme));
  yield takeLatest(
    ThemeActions.toggleDarkMode,
    sagaFunctionFor(toggleDarkMode)
  );
  yield takeLatest(
    ThemeActions.setPrimaryColor,
    sagaFunctionFor(setPrimaryColor)
  );
  yield takeLatest(
    ThemeActions.setSecondaryColor,
    sagaFunctionFor(setSecondaryColor)
  );
  yield takeLatest(ThemeActions.setFontSize, sagaFunctionFor(setFontSize));
  yield takeLatest(ThemeActions.setFontFamily, sagaFunctionFor(setFontFamily));
  yield takeLatest(
    ThemeActions.applyThemeConfig,
    sagaFunctionFor(applyThemeConfig)
  );

  // Customization
  yield takeLatest(
    ThemeActions.customizeThemeProperties,
    sagaFunctionFor(customizeThemeProperties)
  );

  // Theme Management
  yield takeLatest(ThemeActions.switchTheme, sagaFunctionFor(switchTheme));
  yield takeLatest(
    ThemeActions.localizeThemeSettings,
    sagaFunctionFor(localizeThemeSettings)
  );
  yield takeLatest(
    ThemeActions.handleThemeEvents,
    sagaFunctionFor(handleThemeEvents)
  );
  yield takeLatest(
    ThemeActions.documentThemeSettings,
    sagaFunctionFor(documentThemeSettings)
  );

  // Optimization and Performance
  yield takeLatest(
    ThemeActions.optimizeThemePerformance,
    sagaFunctionFor(optimizeThemePerformance)
  );
  yield takeLatest(
    ThemeActions.analyzeThemeUsage,
    sagaFunctionFor(analyzeThemeUsage)
  );
  yield takeLatest(
    ThemeActions.visualizeThemeMetrics,
    sagaFunctionFor(visualizeThemeMetrics)
  );

  // Security and Governance
  yield takeLatest(
    ThemeActions.secureThemeSettings,
    sagaFunctionFor(secureThemeSettings)
  );
  yield takeLatest(
    ThemeActions.governThemeGovernance,
    sagaFunctionFor(governThemeGovernance)
  );
  yield takeLatest(
    ThemeActions.auditThemeCompliance,
    sagaFunctionFor(auditThemeCompliance)
  );
}

export function* themeValidation() {
    yield watchThemeValidationActions()
}