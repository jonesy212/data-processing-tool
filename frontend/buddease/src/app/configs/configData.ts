// configData.ts

import getAppPath from "../../../appPath";
import Logger from "../components/logging/Logger";
import { NotificationTypeEnum } from "../components/support/NotificationContext";
import { AppVersion } from "../components/versions/AppVersion";
import Version from "../components/versions/Version";
import UniqueIDGenerator from "../generators/GenerateUniqueIds";
import ApiConfig from "./ApiConfigComponent";
import dataVersions from "./DataVersionsConfig";
import LazyLoadScriptConfig from './LazyLoadScriptConfig';
import userPreferences from "./UserPreferences";
import userSettings from "./UserSettings";
import BackendStructure from "./appStructure/BackendStructure";
import FrontendStructure from "./appStructure/FrontendStructure";
import detailsConfig from './detailsConfig';



// Define your configuration options
const configurationOptions: any = { // You can replace 'any' with the specific type if known
  timeout: 5000,
  onLoad: () => {
    console.log("Script loaded successfully.");
  },
  retryCount: 3,
  retryDelay: 1000,
  onBeforeLoad: () => {
    console.log("Before loading script...");
  },
  onScriptError: (error: ErrorEvent) => {
    console.error("Script loading error:", error);
  },
  // Include lazyLoadScriptConfig and apiConfig if needed
  lazyLoadScriptConfig: undefined, // Placeholder value
  apiConfig: undefined, // Placeholder value
  // Add more properties as needed
};

// Instantiate AppVersion with initial version number, release date, and release notes
const appVersionObj = new AppVersion({
  appName: "Buddease",
  versionNumber: '1.0.0',
  appVersion: "1.0.0",
  releaseDate: "2024-03-01",
  releaseNotes: ["Initial release"],
});

// Update appVersion dynamically as needed
appVersionObj.updateVersionNumber('1.1.0');


// Add release notes as needed
appVersionObj.addReleaseNotes("Bug fixes and performance improvements");

// Retrieve current app version
const currentAppVersion = appVersionObj.getVersionNumber();

// Generate appVersion using the provided generator
const appVersion = UniqueIDGenerator.generateAppVersion();

// Generate versionNumber using the provided generator
const versionNumber = UniqueIDGenerator.generateVersionNumber();

// Create an instance of the Version class
const version = new Version({ versionNumber, appVersion });

// Include currentAppVersion in a comment or documentation to indicate its purpose
// For example:
// The current version of the application is stored in currentAppVersion constant.

const projectPath = getAppPath(versionNumber, appVersion); // Get the project path dynamically

const frontendStructure = new FrontendStructure("frontendStructure");
const backendStructure = new BackendStructure("backendStructure");

// Create lazyLoadScriptConfig object
configurationOptions.lazyLoadScriptConfig = new LazyLoadScriptConfig(projectPath, configurationOptions); 

// Create apiConfig object
configurationOptions.apiConfig = ApiConfig("apiConfig");

const lazyLoadScriptConfig = configurationOptions.lazyLoadScriptConfig; // Use the created object
const apiConfig = configurationOptions.apiConfig; // Use the created object

// Logging configuration changes
Logger.logWithOptions(
  "Configuration", 
  "Configuration data updated", 
  UniqueIDGenerator.generateID("config", "update", NotificationTypeEnum.Configuration)
);


const configData = {
  lastUpdated: "",
  userPreferences,
  userSettings,
  dataVersions,
  lazyLoadScriptConfig,
  apiConfig,
  version,
  detailsConfig,
  frontendStructure,
  backendStructure,
  currentAppVersion,
  database
};

export default configData;


'excuse me sir, are you attempting to traffic my person'
// he is going to say no: 'no, i am not',
// he gives you a ticket of avadavit - 30 day notice - presummed guity
// they open up a trust in every court case - bid, performance, payment bond, trade a Cista Cave Trust - then seing them as debt instruments
// grab an affavidative of truth