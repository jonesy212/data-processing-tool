import MainConfig from '@/app/configs/MainConfig';
import { SystemConfigs } from '../api/systemConfigs';
import { UserConfigs } from "../api/userConfigs";
import { AquaConfig } from '../components/web3/web_configs/AquaConfig';
import ShoppingCenterConfig from '../shopping_center/ShoppingCenterConfig';
import { BackendConfig } from './BackendConfig';
import { ApiConfig } from "./ConfigurationService";
import { DataVersions } from './DataVersionsConfig';
import { DocumentBuilderConfig } from './DocumentBuilderConfig';
import { FrontendConfig } from './FrontendConfig';

// LazyLoadScriptConfig.ts
interface LazyLoadScriptConfig {
  // Configuration properties related to lazy loading scripts
  timeout?: number; // Timeout for script loading in milliseconds
  retryCount?: number; // Retry count in case of script loading failure
  retryDelay?: number; // Delay between retry attempts in milliseconds
  asyncLoad?: boolean; // Asynchronously load scripts
  deferLoad?: boolean; // Defer script execution
  nonce?: string; // Nonce value for script integrity checks

  // Callback functions
  onLoad?: () => void; // Custom callback function after script is loaded
  onBeforeLoad?: () => void; // Callback before script loading starts
  onScriptError?: (error: ErrorEvent) => void; // Callback on script error

  // Integration options with third-party services
  thirdPartyLibrary?: string; // Name of the third-party library being loaded
  thirdPartyAPIKey?: string; // API key for third-party service integration

  // Additional properties
  apiConfig?: ApiConfig; // API configuration
  namingConventions?: string[]; // Naming conventions
  // Add more properties as needed
}

class LazyLoadScriptConfigImpl implements LazyLoadScriptConfig {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  asyncLoad?: boolean;
  deferLoad?: boolean;
  nonce?: string;
  onLoad?: () => void;
  onBeforeLoad?: () => void;
  onScriptError?: (error: ErrorEvent) => void;
  onTimeout?: () => void;
  thirdPartyLibrary?: string;
  thirdPartyAPIKey?: string;
  namingConventions?: string[];
  
  // Additional associated properties
  apiConfig?: ApiConfig;
  dataVersions?: (versions: DataVersions) => void;
  systemConfigs?: typeof SystemConfigs;
  userConfigs?: typeof UserConfigs;
  aquaConfig?: AquaConfig;
  storeConfig?: ShoppingCenterConfig;
  documentConfig?: DocumentBuilderConfig
  frontendConfig?: FrontendConfig
  backendCnfig?: BackendConfig
  mainConfig?: typeof MainConfig
  constructor({
    timeout,
    onLoad,
    retryCount,
    retryDelay,
    onBeforeLoad,
    onScriptError,
    onTimeout,
    dataVersions,
    systemConfigs,
    asyncLoad,
    deferLoad,
    thirdPartyLibrary,
    thirdPartyAPIKey,
    nonce,
    apiConfig,
    namingConventions
  }: {
    timeout?: number;
    onLoad?: () => void;
    retryCount?: number;
    retryDelay?: number;
    onBeforeLoad?: () => void;
    onScriptError?: (error: ErrorEvent) => void;
    onTimeout?: () => void;
    dataVersions?: (versions: DataVersions) => void;
    systemConfigs?: typeof SystemConfigs;
    asyncLoad?: boolean;
    deferLoad?: boolean;
    thirdPartyLibrary?: string;
    thirdPartyAPIKey?: string;
    nonce?: string;
    apiConfig?: ApiConfig;
    namingConventions?: string[];
  }) {
    this.timeout = timeout;
    this.onLoad = onLoad;
    this.retryCount = retryCount;
    this.retryDelay = retryDelay;
    this.onBeforeLoad = onBeforeLoad;
    this.onScriptError = onScriptError;
    this.onTimeout = onTimeout;
    this.dataVersions = dataVersions;
    this.systemConfigs = systemConfigs;
    this.asyncLoad = asyncLoad;
    this.deferLoad = deferLoad;
    this.thirdPartyLibrary = thirdPartyLibrary;
    this.thirdPartyAPIKey = thirdPartyAPIKey;
    this.nonce = nonce;
    this.apiConfig = apiConfig;
    this.namingConventions = namingConventions;
  }
}

export default LazyLoadScriptConfigImpl;
