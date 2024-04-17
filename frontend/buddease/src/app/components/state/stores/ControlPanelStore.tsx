import { makeAutoObservable } from "mobx";
import { useState } from "react";

// Define the ControlPanelStore class
class ControlPanelStore {
  theme = "light";
  userSettings = {};
  featureToggles = {};
  integrationOptions = {};
  accessControl = {};
  errorHandling = {};
  customizationOptions = {};
  loggingSettings = {};
  miscellaneousConfigurations = {};

  constructor() {
    makeAutoObservable(this); // Make all properties observable
  }

  // Action to toggle the theme
  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
  }

  // Action to update user settings
  updateUserSettings(settings: string[]) {
    this.userSettings = settings;
  }

  // Action to update feature toggles
  updateFeatureToggles(toggles: string[]) {
    this.featureToggles = toggles;
  }

  // Action to update integration options
  updateIntegrationOptions(options: string[]) {
    this.integrationOptions = options;
  }

  // Action to update access control
  updateAccessControl(control: string) {
    this.accessControl = control;
  }
    
    
  updateErrorHandling(errors: string) {
    this.errorHandling = errors;
  }


  // Action to update customization options
  updateCustomizationOptions(options: string[]) {
    this.customizationOptions = options;
  }

  // Action to update logging settings
  updateLoggingSettings(settings: string[]) {
    this.loggingSettings = settings;
  }

  // Action to update miscellaneous configurations
  updateMiscellaneousConfigurations(configs: string[]) {
    this.miscellaneousConfigurations = configs;
  }
}

// Create an instance of ControlPanelStore
const controlPanelStore = new ControlPanelStore();

// Define the useControlPanelStore hook
const useControlPanelStore = () => {
  const [theme, setTheme] = useState("light");

  // Action to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    controlPanelStore.toggleTheme();
  };

  // Expose the theme and toggleTheme action
  return {
    theme,
    toggleTheme,

    userSettings: controlPanelStore.userSettings,
    featureToggles: controlPanelStore.featureToggles,
    integrationOptions: controlPanelStore.integrationOptions,
    accessControl: controlPanelStore.accessControl,
    errorHandling: controlPanelStore.errorHandling,
    customizationOptions: controlPanelStore.customizationOptions,
    loggingSettings: controlPanelStore.loggingSettings,
    miscellaneousConfigurations: controlPanelStore.miscellaneousConfigurations,

    // Expose the MobX store instance
    store: controlPanelStore,
  };
};

export default useControlPanelStore;
