import ApiConfig from "../components/api/ApiConfigComponent";
import Version from "../components/versions/Version";
import dataVersions from "./DataVersionsConfig";
import LazyLoadScriptConfig from './LazyLoadScriptConfig';
import userPreferences from "./UserPreferences";
import userSettings from "./UserSettings";
import FrontendStructure from "./appStructure/FrontendStructure";
import detailsConfig from './detailsConfig';

// Create an instance of the Version class
const version = new Version({ versionNumber: "currentVersion" });

const frontendStructure = new FrontendStructure("frontendStructure");
const lazyLoadScriptConfig = new LazyLoadScriptConfig("lazyLoadScriptConfig"); 
const apiConfig =  ApiConfig("apiConfig");

const configData = {
  lastUpdated: "",
  userPreferences,
  userSettings,
  dataVersions,
  frontendStructure,
  lazyLoadScriptConfig,
  apiConfig,
  version,
  detailsConfig,
};

export default configData;
