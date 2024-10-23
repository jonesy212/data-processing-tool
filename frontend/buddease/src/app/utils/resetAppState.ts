// resetAppState.ts

import { useDispatch } from "react-redux";
import { resetState } from "../components/state/redux/slices/AppSlice";
import userSettings from "../configs/UserSettings";
import useSettingManagerStore from "../components/state/stores/SettingsStore";
import { useThemeConfig } from "../components/hooks/userInterface/ThemeConfigContext";
import { isUserLoggedIn } from "../pages/forms/utils/CommonLoginLogic";
import { ThemeConfig } from "../components/libraries/ui/theme/ThemeConfig";
import { ThemeEnum } from "../components/libraries/ui/theme/Theme";
import UserService from "../components/users/ApiUser";


const dispatch = useDispatch()
// Assume this is determined elsewhere in your application
const isUsingRedux = true; // Set to false if using MobX

const resetAppState = async () => {
  // Resetting application state logic goes here
  // For example, you might want to reset state variables to their initial values, clear local storage, or perform any other necessary actions

  // Use isUserLoggedIn to check the user status
  const userStatus = await isUserLoggedIn(); // This returns a Promise
  const isUserLoggedInLocal = userStatus.isLoggedIn; // Set the login status


  // Use useThemeConfig to reset the theme
  const { setThemeConfig } = useThemeConfig(); // Assume useThemeConfig provides a setter for theme
  if(setThemeConfig === undefined){
    throw new Error("setThemeConfig is undefined");
  }
  const selectedThemeLocal: ThemeConfig = {
    theme: ThemeEnum.LIGHT,
    infoColor: "#007bff",
    primaryColor: "#ffffff",
    secondaryColor: "#f0f0f0",
  };

  setThemeConfig(selectedThemeLocal); // Set the theme using the theme setter

  if (isUsingRedux) {
    // Reset Redux store
    const dispatch = useDispatch();
    dispatch(resetState()); // Call the reset action for Redux
  } else {

    // Reset MobX store
    useSettingManagerStore().reset(); 
  }
  // Clearing local storage
  localStorage.clear();


  // User-specific actions
  if (isUserLoggedInLocal) {
    console.log("User is logged in. You may want to handle user-specific resets.");

    // 1. Re-fetch user data
    const userData = await UserService.fetchUserById(userStatus.userId);
    // Assume you have a Redux or MobX action to set user data
    if (isUsingRedux) {
      dispatch(setUserData(userData)); // Dispatch action to set user data
    } else {
      const settingStore = useSettingManagerStore();
      settingStore.setUserData(userData); // Use MobX to set user data
    }

    // 2. Reset any user-specific settings/preferences
    if (isUsingRedux) {
      dispatch(resetUserPreferences()); // Redux action to reset user preferences
    } else {
      const settingStore = useSettingManagerStore();
      settingStore.resetUserPreferences(); // MobX action to reset user preferences
    }

    // 3. Reinitialize user-related features (e.g., subscriptions, notifications)
    initializeUserFeatures(userStatus.userId);

  } else {
    console.log("User is not logged in. Ensure to handle any guest-specific resets.");

    // 1. Clear any temporary guest data
    if (isUsingRedux) {
      dispatch(clearGuestData()); // Redux action to clear guest data
    } else {
      const settingStore = useSettingManagerStore();
      settingStore.clearGuestData(); // MobX action to clear guest data
    }

    // 2. Reset guest experience settings (e.g., preferences for onboarding)
    resetGuestExperience();

    // 3. Prompt for login or display a guest message
    showLoginPrompt(); // Show a login modal or redirect to login page
  }

  // Other necessary actions to reset the application state
  // For example:
  // - Resetting UI components
  resetUIComponents();
  // - Clearing cached data
  clearCachedData();
  // - Closing open dialogs or modals
  closeDialogsAndModals();
  // - Resetting user preferences
  resetUserPreferences();

  // Resetting UI components
  resetUIComponents();

  // Clearing cached data
  clearCachedData();

  // Closing open dialogs or modals
  closeDialogsAndModals();

  // Resetting user preferences
  resetUserPreferences();

  console.log("Application state has been reset.");
};

// Additional functions for specific reset actions
const resetUIComponents = () => {
  // Reset UI components logic goes here
  console.log("UI components have been reset.");
};

const clearCachedData = () => {
  // Clear cached data logic goes here
  console.log("Cached data has been cleared.");
};

const closeDialogsAndModals = () => {
  // Close dialogs and modals logic goes here
  console.log("Dialogs and modals have been closed.");
};

const resetUserPreferences = () => {
  // Reset user preferences logic goes here
  console.log("User preferences have been reset.");
};


export { resetAppState }