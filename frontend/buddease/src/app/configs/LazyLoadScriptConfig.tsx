import { ApiConfig } from "./ConfigurationService";

// LazyLoadScriptConfig.ts
interface LazyLoadScriptConfig {
  // Add any configuration properties related to lazy loading scripts
  // Example:
  timeout?: number; // Timeout for script loading in milliseconds
  // Additional properties based on existing context

  // Custom callback function after script is loaded
  onLoad?: () => void;

  // Retry configuration in case of script loading failure
  retryCount?: number;
  retryDelay?: number; // Delay between retry attempts in milliseconds

  // Additional events to trigger callbacks
  onBeforeLoad?: () => void; // Callback before script loading starts
  onScriptError?: (error: ErrorEvent) => void; // Callback on script error

  // Additional flags for script loading behavior
  asyncLoad?: boolean; // Asynchronously load scripts
  deferLoad?: boolean; // Defer script execution

  // Integration options with third-party services
  thirdPartyLibrary?: string; // Name of the third-party library being loaded
  thirdPartyAPIKey?: string; // API key for third-party service integration

  // Additional security measures
  nonce?: string; // Nonce value for script integrity checks

  apiConfig?: ApiConfig;

  namingConventions?: string[];
  // More properties as needed
}

class LazyLoadScriptConfigImpl implements LazyLoadScriptConfig {
  timeout?: number;
  onLoad?: () => void;
  retryCount?: number;
  retryDelay?: number;
  onBeforeLoad?: () => void;
  onScriptError?: (error: ErrorEvent) => void;
  asyncLoad?: boolean;
  deferLoad?: boolean;
  thirdPartyLibrary?: string;
  thirdPartyAPIKey?: string;
  nonce?: string;
  apiConfig?: ApiConfig;
  namingConventions?: string[];

  constructor(timeout?: number, onLoad?: () => void, retryCount?: number, retryDelay?: number, onBeforeLoad?: () => void, onScriptError?: (error: ErrorEvent) => void, asyncLoad?: boolean, deferLoad?: boolean, thirdPartyLibrary?: string, thirdPartyAPIKey?: string, nonce?: string, apiConfig?: ApiConfig, namingConventions?: string[]) {
    this.timeout = timeout;
    this.onLoad = onLoad;
    this.retryCount = retryCount;
    this.retryDelay = retryDelay;
    this.onBeforeLoad = onBeforeLoad;
    this.onScriptError = onScriptError;
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
