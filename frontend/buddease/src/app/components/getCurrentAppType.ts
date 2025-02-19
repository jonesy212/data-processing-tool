import { AppConfig, getAppConfig } from "../configs/AppConfig";
 import { RootState } from "./state/redux/slices/RootSlice";

const getCurrentAppType = (state: RootState): string => {
  // Retrieve the app configuration
  const appConfig: AppConfig = getAppConfig();

  // Access the app name from the configuration
  const appName: string = state.settingsManager.appName;

  // Add logic to determine the app type based on the app name or other criteria
  if (appName.toLowerCase().includes("editor")) {
    return "Text Editing App";
  } else if (appName.toLowerCase().includes("search")) {
    return "Search App";
  } else if (appName.toLowerCase().includes("calendar")) {
    return "Calendar App";
  } else if (appName.toLowerCase().includes("todo")) {
    return "To-Do App";
  } else if (appName.toLowerCase().includes("project")) {
    return "Project Management App";
  } else {
    // If the app name does not match any known patterns, return a default value
    return "Unknown App";
  }
};

// Usage example:
const state: RootState = {} as RootState
export const currentAppType: string = getCurrentAppType(state);
console.log("Current App Type:", currentAppType);
