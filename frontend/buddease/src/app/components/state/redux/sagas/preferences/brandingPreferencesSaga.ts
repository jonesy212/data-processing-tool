// Import necessary dependencies and constants
import { DocumentFormattingOptions } from '@/app/components/documents/ DocumentFormattingOptionsComponent';
import NOTIFICATION_MESSAGES from '@/app/components/support/NotificationMessages';
import { UserBrandingPreferencesActions } from '@/app/configs/UserPreferencesActions';
import { themeService } from '@/app/libraries/theme/ThemeService';
import { PayloadAction } from '@reduxjs/toolkit';
import { all, put, takeLatest } from 'redux-saga/effects';
import { fetchUserPreferencesSaga } from './userPreferencesSagaManager';
import { ColorSwatchProps } from '@/app/components/styling/ColorPalette';





function* handleSetColorScheme(action: PayloadAction<string>) {
  try {
    // Logic to handle setting color scheme
    themeService.applyColorScheme(action.payload); // Use applyColorScheme instead of setColorScheme
  } catch (error) {
    console.error('Error setting color scheme:', error);
    // Dispatch an action to show error notification
    yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set color scheme.' });
  }
}

function* handleSetColors(action: PayloadAction<ColorSwatchProps[]>) { 
  try {
    // Logic to handle setting colors
    themeService.applyColors(action.payload); // Use applyColors instead of setColors
  } catch (error) {
    console.error('Error setting colors:', error);
    // Dispatch an action to show error notification
    yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set colors.' });
  }
}


// Saga for setting font styles
function* handleSetFontStyles(action: PayloadAction<DocumentFormattingOptions>) {
    try {
      const fontStyles: DocumentFormattingOptions = action.payload;
      
      // Apply the font styles using the themeService instance
      themeService.applyFontStyles(fontStyles);
      
      // Dispatch an action or perform any additional logic as needed
      
    } catch (error) {
      console.error('Error setting font styles:', error);
      // Dispatch an action to show error notification
      yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set font styles.' });
    }
  }
  

  






  // Saga for setting background image
  function* handleSetBackgroundImage(action: PayloadAction<string>) {
    try {
      const backgroundImageUrl = action.payload; // Assuming the payload contains the background image URL
      
      // Apply the background image using a service or method
      // Example: BackgroundService.applyBackgroundImage(backgroundImageUrl);
      
      // Dispatch an action or perform any additional logic as needed
      
    } catch (error) {
      console.error('Error setting background image:', error);
      // Dispatch an action to show error notification
      yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set background image.' });
    }
  }
  
  // Saga for setting iconography
  function* handleSetIconography(action: PayloadAction<string>) {
    try {
      const iconography = action.payload; // Assuming the payload contains the iconography
      
      // Apply the iconography using a service or method
      // Example: IconService.applyIconography(iconography);
      
      // Dispatch an action or perform any additional logic as needed
      
    } catch (error) {
      console.error('Error setting iconography:', error);
      // Dispatch an action to show error notification
      yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set iconography.' });
    }
  }
  
  // Saga for setting button styles
  function* handleSetButtonStyles(action: PayloadAction<string>) {
    try {
      const buttonStyles = action.payload; // Assuming the payload contains the button styles
      
      // Apply the button styles using a service or method
      // Example: ButtonService.applyButtonStyles(buttonStyles);
      
      // Dispatch an action or perform any additional logic as needed
      
    } catch (error) {
      console.error('Error setting button styles:', error);
      // Dispatch an action to show error notification
      yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set button styles.' });
    }
  }



  
  // Saga for setting typography
  function* handleSetTypography(action: PayloadAction<string>) {
    try {
      const typography = action.payload; // Assuming the payload contains the typography
      
      // Apply the typography using a service or method
      // Example: TypographyService.applyTypography(typography);
      
      // Dispatch an action or perform any additional logic as needed
      
    } catch (error) {
      console.error('Error setting typography:', error);
      // Dispatch an action to show error notification
      yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set typography.' });
    }
  }
  
  // Sample Sagas for handling user preferences actions
  function* handleSetUserBrandColors(action: PayloadAction<string[]>) {
    try {
      const brandColors = action.payload; // Assuming the payload contains the user brand colors
      
      // Apply the user brand colors using a service or method
      // Example: BrandColorService.applyUserBrandColors(brandColors);
      
      // Dispatch an action or perform any additional logic as needed
      
    } catch (error) {
      console.error('Error setting user brand colors:', error);
      // Dispatch an action to show error notification
      yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set user brand colors.' });
    }
  }
  
  function* handleSetUserLogo(action: PayloadAction<string>) {
    try {
      const logoUrl = action.payload; // Assuming the payload contains the user logo URL
      
      // Apply the user logo using a service or method
      // Example: LogoService.applyUserLogo(logoUrl);
      
      // Dispatch an action or perform any additional logic as needed
      
    } catch (error) {
      console.error('Error setting user logo:', error);
      // Dispatch an action to show error notification
      yield put({ type: NOTIFICATION_MESSAGES.Preferences.DEFAULT_SETTINGS_ERROR, payload: 'Failed to set user logo.' });
    }
  }
  

// Worker Saga: Fetch User Preferences


// Watcher Saga: Watches for user preferences actions
function* watchUserPreferencesActions() {
  yield all([
    takeLatest(UserBrandingPreferencesActions.setUserBrandColors.type, handleSetUserBrandColors),
    takeLatest(UserBrandingPreferencesActions.setUserLogo.type, handleSetUserLogo),
    takeLatest(UserBrandingPreferencesActions.setFontStyles.type, handleSetFontStyles),
    takeLatest(UserBrandingPreferencesActions.setBackgroundImage.type, handleSetBackgroundImage),
    takeLatest(UserBrandingPreferencesActions.setIconography.type, handleSetIconography),
    takeLatest(UserBrandingPreferencesActions.setButtonStyles.type, handleSetButtonStyles),
    takeLatest(UserBrandingPreferencesActions.setTypography.type, handleSetTypography),
    takeLatest(UserBrandingPreferencesActions.setTheme.type, handleSetColorScheme),
    takeLatest("FETCH_USER_PREFERENCES", fetchUserPreferencesSaga), // Action type should be provided here

    takeLatest(UserBrandingPreferencesActions.setColors.type, handleSetColors),
    "setShadows",
    "setSpacing",
    "setHeaderColor",
    "setBorderColor",
    "setBackgroundColor",
    "setHoverColor",
    "setHoverTextColor",
    "setHoverBackgroundColor",
    "setLinkColor",
    "setLinkHoverColor",
    "setLinkVisitedColor",
    "setLinkActiveColor",
    "setLinkVisitedHoverColor",
    "setLinkActiveHoverColor",
    "setLinkDisabledColor",
    "setLinkDisabledHoverColor",
    "setLinkDisabledVisitedColor",
    "setLinkDisabledActiveColor",
    "setLinkDisabledVisitedHoverColor",
    "setLinkDisabledActiveHoverColor",
    "setLinkDisabledBackgroundColor",
    "setLinkDisabledHoverBackgroundColor",
    "setLinkDisabledVisitedBackgroundColor",
    "setLinkDisabledActiveBackgroundColor",
    "setLinkDisabledVisitedHoverBackgroundColor",
    "setButtonColor",
    "setButtonTextColor",
    "setButtonBackgroundColor",
    "setButtonHoverColor",
    "setButtonHoverTextColor",
    "setButtonHoverBackgroundColor",
    "setButtonActiveColor",
    "setButtonActiveTextColor",
    "setButtonActiveBackgroundColor",
    "setButtonDisabledColor",
    "setButtonDisabledTextColor",
    "setButtonDisabledBackgroundColor",
    "setButtonFocusColor",
    "setButtonFocusTextColor",
    "setButtonFocusBackgroundColor",
    "setButtonBorderColor",
    "setButtonBorderRadius",
    "setButtonBorderWidth",
    "setButtonShadow",
    "setButtonPadding",
    "setButtonTransition",
    "setButtonFontFamily",
    "setButtonFontSize",
    "setButtonFontWeight",
    "setButtonLineHeight",
    "setButtonLetterSpacing",
    "setButtonTextTransform",
    "setButtonTextDecoration",
    "setButtonTextShadow",
    "setButtonOpacity",
    "setButtonCursor",
    "setButtonOutline"
  ])
    // Add more watchers for other user preferences actions...
}

// Root Saga
export default function* brandingPreferencesSaga() {
  yield all([
    watchUserPreferencesActions(),

    // Add more root sagas for other features...
  ]);
}
