// mainConfig.ts
import dataVersions from "./DataVersions";
import frontendStructure from "./FrontendStructure";
import userPreferences from "./UserPreferences";
import userSettings from "./UserSettings";
import { ApiConfig } from "./ConfigurationService";
import lazyLoadScriptConfig
const cacheData = {
  lastUpdated: "",
  userPreferences,
  userSettings,
  dataVersions,
  frontendStructure,
  lazyLoadScriptConfig,
  apiConfig
};

export default cacheData;
