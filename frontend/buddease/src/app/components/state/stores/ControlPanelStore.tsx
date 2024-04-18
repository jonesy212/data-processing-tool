import { makeAutoObservable } from "mobx";
import { useState } from "react";

class ControlPanelStore {
  theme = "light";
  userSettings = {
    language: "English",
    notifications: true,
    timeZone: "GMT",
  };
  featureToggles = {
    analytics: true,
    paymentIntegration: false,
    advancedReporting: true,
  };
  integrationOptions = {
    thirdPartyAPIs: {
      googleMaps: true,
      socialMedia: false,
      paymentGateways: true,
    },
    dataSources: {
      internalDatabase: true,
      externalAPIs: true,
      cloudStorage: false,
    },
  };
  accessControl = {
    roleBasedAccess: true,
    permissionLevels: ["Admin", "Manager", "User"],
    accessRules: {
      dashboardAccess: ["Admin", "Manager"],
      reportAccess: ["Admin", "Manager", "User"],
    },
  };
  errorHandling = {
    logErrors: true,
    errorReporting: true,
    alertNotifications: false,
  };
  customizationOptions = {
    colorPalette: ["Primary", "Secondary", "Accent"],
    typography: ["Heading", "Body", "Button"],
    layoutOptions: ["Grid", "Flexbox", "CSS Grid"],
  };
  loggingSettings = {
    logLevel: "info",
    monitoringFrequency: "1 minute",
    logRetentionPeriod: "90 days",
  };
  miscellaneousConfigurations = {
    cacheExpiration: "1 hour",
    dataEncryption: true,
    automaticBackups: false,
  };

  // Additional options
  developmentServices = {
    individualDevelopers: true,
    smallProjectTeams: true,
    compensation: "project-based",
    selectionCriteria: ["skills", "experience", "performance"],
  };
  globalCollaborationFeatures = {
    communicationTools: ["audio", "video", "text", "real-time"],
    projectManagementFramework: "phases-based",
    dataAnalysisTools: true,
  };
  communityInvolvement = {
    participation: "active",
    emphasis: "unity",
    rewards: "contributions",
    reinvestment: "liquidity",
  };
  monetizationOpportunities = {
    clientProjects: true,
    compensation: "project scope and complexity",
    incentivization: "project metrics",
    revenueContribution: "sustainability",
  };

  constructor() {
    makeAutoObservable(this); // Make all properties observable
  }

  // Action to toggle the theme
  toggleTheme() {
    this.theme = this.theme === "light" ? "dark" : "light";
  }

  // Action to update user settings
  updateUserSettings(settings: any) {
    this.userSettings = { ...this.userSettings, ...settings };
  }

  // Action to update feature toggles
  updateFeatureToggles(toggles: any) {
    this.featureToggles = { ...this.featureToggles, ...toggles };
  }

  // Action to update integration options
  updateIntegrationOptions(options: any) {
    this.integrationOptions = { ...this.integrationOptions, ...options };
  }

  // Action to update access control
  updateAccessControl(control: any) {
    this.accessControl = { ...this.accessControl, ...control };
  }

  // Action to update error handling
  updateErrorHandling(errors: any) {
    this.errorHandling = { ...this.errorHandling, ...errors };
  }

  // Action to update customization options
  updateCustomizationOptions(options: any) {
    this.customizationOptions = { ...this.customizationOptions, ...options };
  }

  // Action to update logging settings
  updateLoggingSettings(settings: any) {
    this.loggingSettings = { ...this.loggingSettings, ...settings };
  }

  // Action to update miscellaneous configurations
  updateMiscellaneousConfigurations(configs: any) {
    this.miscellaneousConfigurations = {
      ...this.miscellaneousConfigurations,
      ...configs,
    };
  }
}

// Create an instance of ControlPanelStore
const controlPanelStoreInstance = new ControlPanelStore();

// Define the useControlPanelStore hook
const useControlPanelStore = () => {
  const [theme, setTheme] = useState("light");

  // Action to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    controlPanelStoreInstance.toggleTheme();
  };

  // Expose the theme and toggleTheme action
  return {
    theme,
    toggleTheme,
    userSettings: controlPanelStoreInstance.userSettings,
    featureToggles: controlPanelStoreInstance.featureToggles,
    integrationOptions: controlPanelStoreInstance.integrationOptions,
    accessControl: controlPanelStoreInstance.accessControl,
    errorHandling: controlPanelStoreInstance.errorHandling,
    customizationOptions: controlPanelStoreInstance.customizationOptions,
    loggingSettings: controlPanelStoreInstance.loggingSettings,
    miscellaneousConfigurations:
      controlPanelStoreInstance.miscellaneousConfigurations,

    developmentServices: controlPanelStoreInstance.developmentServices, // Added
    globalCollaborationFeatures:
      controlPanelStoreInstance.globalCollaborationFeatures, // Added
    communityInvolvement: controlPanelStoreInstance.communityInvolvement, // Added
    monetizationOpportunities:
      controlPanelStoreInstance.monetizationOpportunities, // Added

    // Expose the MobX store instance
    store: controlPanelStoreInstance,

    // Add other actions to update store properties here
    updateUserSettings: controlPanelStoreInstance.updateUserSettings.bind(
      controlPanelStoreInstance
    ),
    updateFeatureToggles: controlPanelStoreInstance.updateFeatureToggles.bind(
      controlPanelStoreInstance
    ),
    updateIntegrationOptions:
      controlPanelStoreInstance.updateIntegrationOptions.bind(
        controlPanelStoreInstance
      ),
    updateAccessControl: controlPanelStoreInstance.updateAccessControl.bind(
      controlPanelStoreInstance
    ),
    updateErrorHandling: controlPanelStoreInstance.updateErrorHandling.bind(
      controlPanelStoreInstance
    ),
    updateCustomizationOptions:
      controlPanelStoreInstance.updateCustomizationOptions.bind(
        controlPanelStoreInstance
      ),
    updateLoggingSettings: controlPanelStoreInstance.updateLoggingSettings.bind(
      controlPanelStoreInstance
    ),
    updateMiscellaneousConfigurations:
      controlPanelStoreInstance.updateMiscellaneousConfigurations.bind(
        controlPanelStoreInstance
      ),
  };
};

export default useControlPanelStore;
