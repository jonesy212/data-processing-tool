// mainConfig.ts
import dataVersions from "./DataVersionsConfig";
import frontendStructure from "./FrontendStructure";
import userPreferences from "./UserPreferences";
import userSettings from "./UserSettings";

const cacheData = {
  lastUpdated: "",
  userPreferences,
  userSettings,
  dataVersions,
  frontendStructure,
  lazyLoadScriptConfig,
  apiConfig,
  version
};

export default cacheData;
