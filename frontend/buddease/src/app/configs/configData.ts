// configData.ts

import getAppPath from "../../../appPath";
import ApiConfig from "../components/api/ApiConfigComponent";
import { AppVersion } from "../components/versions/AppVersion";
import Version from "../components/versions/Version";
import dataVersions from "./DataVersionsConfig";
import LazyLoadScriptConfig from './LazyLoadScriptConfig';
import userPreferences from "./UserPreferences";
import userSettings from "./UserSettings";
import BackendStructure from "./appStructure/BackendStructure";
import FrontendStructure from "./appStructure/FrontendStructure";
import detailsConfig from './detailsConfig';

// Instantiate AppVersion with initial version number, release date, and release notes
const appVersion = new AppVersion({
  versionNumber: '1.0.0',
  appVersion: "1.0.0",
  releaseDate: "2024-03-01",
  releaseNotes: ["Initial release"],
});

// Update appVersion dynamically as needed
appVersion.updateVersionNumber('1.1.0');

// Add release notes as needed
appVersion.addReleaseNotes("Bug fixes and performance improvements");

// Retrieve current app version
const currentAppVersion = appVersion.getVersionNumber();

// Create an instance of the Version class
const version = new Version({ versionNumber: "currentVersion", appVersion: currentAppVersion });

// Include currentAppVersion in a comment or documentation to indicate its purpose
// For example:
// The current version of the application is stored in currentAppVersion constant.

const projectPath = getAppPath(); // Get the project path dynamically

const frontendStructure = new FrontendStructure("frontendStructure");
const backendStructure = new BackendStructure("backendStructure");

const lazyLoadScriptConfig = new LazyLoadScriptConfig(projectPath, {/* Your configuration options */}); 
const apiConfig =  ApiConfig("apiConfig");

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
  currentAppVersion
};

export default configData;
