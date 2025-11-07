// configData.ts
import { getCurrentAppInfo } from "@/app/versions/VersionGenerator";
import { NotificationTypeEnum } from "@/context/NotificationContext";
import Logger from "@/app/libraries/logging/Logger";
import { AppVersion } from "@/app/versions/AppVersion";
import { Version } from "@/app/versions/Version";
import { database } from "@/app/generators/GenerateDatabase";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import ApiConfig from "@/app/components/configs/ApiConfigComponent";
import dataVersions from "@/app/configs/DataVersionsConfig";
import LazyLoadScriptConfig from '@/app/config/LazyLoadScriptConfig';
import { userPreferences } from "@/app/config/UserPreferences";
import userSettings from "@/app/config/UserSettings";
import BackendStructure from "@/app/server/database/BackendStructure";
import FrontendStructure from "@/app/config/appStructure/FrontendStructure";
import getAppPath from "@/app/config/appStructure/appPath";
import appDetailsConfig from '@/config/endpoints/appDetailsConfig';



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
  let versionNumber = getCurrentAppInfo()?.versionNumber;
  if (!versionNumber) {
    versionNumber = UniqueIDGenerator.generateVersionNumber();
  }

  const appVersionString = "1.0.0"; // initial semantic version

// Instantiate AppVersion with initial version number, release date, and release notes
const appVersionObj = new AppVersion({
  appName: "Buddease",
  versionNumber: versionNumber,          // use the resolved versionNumber
  appVersion: appVersionString,          // app version string
  releaseDate: "2024-03-01",
  releaseNotes: ["Initial release"],
  major: 1,
  minor: 0,
  patch: 0,
  prerelease: false,
  build: 0,
  isDevBuild: false
});

// Update appVersion dynamically as needed
appVersionObj.bumpVersion("Bug fixes and performance improvements");

// Add release notes as needed
appVersionObj.addReleaseNotes("Bug fixes and performance improvements");

// Retrieve current app version
const currentAppVersion = appVersionObj.getVersionNumber();

// Generate appVersion using the provided generator
const appVersion = UniqueIDGenerator.generateAppVersion();

// Generate versionNumber using the provided generator
const newVersionNumber = UniqueIDGenerator.generateVersionNumber();

// Create an instance of the Version class
const version = new Version({
  versionNumber: newVersionNumber,
  appVersion: appVersionString,
  major: 1,
  minor: 0,
  patch: 0,
  structureData: "",          // provide actual data if available
  buildVersions: undefined    // optional
});
// Include currentAppVersion in a comment or documentation to indicate its purpose
// For example:
// The current version of the application is stored in currentAppVersion constant.

const projectPath = getAppPath(newVersionNumber, appVersion); // Get the project path dynamically

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
  appDetailsConfig,
  frontendStructure,
  backendStructure,
  currentAppVersion,
  database
};

export default configData;


// 'excuse me sir, are you attempting to traffic my person'
// he is going to say no: 'no, i am not',
// he gives you a ticket of avadavit - 30 day notice - presummed guity
// they open up a trust in every court case - bid, performance, payment bond, trade a Cista Cave Trust - then seing them as debt instruments
// grab an affavidative of truth