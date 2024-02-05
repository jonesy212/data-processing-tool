import ApiConfig from "../components/api/ApiConfigComponent";
import dataVersions from "./DataVersionsConfig";
import { LazyLoadScriptConfig } from './LazyLoadScriptConfig';
import userPreferences from "./UserPreferences";
import userSettings from "./UserSettings";
import version from "./Version";
import FrontendStructure from "./appStructure/FrontendStructure";

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
  version
};

export default configData;
