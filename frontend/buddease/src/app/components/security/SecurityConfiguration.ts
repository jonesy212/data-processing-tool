// SecurityConfiguration.ts
import { SnapshotConfig } from '@/app/components/snapshots/SnapshotConfig';

import { ApiConfig, ConfigurationOptions, ConfigurationService } from "@/app/configs/ConfigurationService";
import LazyLoadScriptConfigImpl from '@/app/configs/LazyLoadScriptConfig';
import LoggerConfig from "@/app/configs/LoggerConfig";

  // Define Security Configuration Interface
  export interface SecurityConfiguration {
      headers: ApiConfig['headers']; // Security headers
      logger: Partial<LoggerConfig>; // Logger configuration
      // Add more security parameters as needed
    }
    
  // Extend ConfigurationService to handle security configurations
  class SecurityConfigurationService implements ConfigurationService {
    private static instance: SecurityConfigurationService;
    apiConfig: ApiConfig;
    cachedConfig: LazyLoadScriptConfigImpl;
    apiConfigSubscribers: Array<(config: ApiConfig) => void>;
    
    // Security-specific configuration
    private securityConfig: SecurityConfiguration;

    // Private constructor for singleton pattern
    private constructor() {
        // Initialize securityConfig with default values
        this.securityConfig = {
            headers: { Authorization: "Bearer token" },
            logger: { level: "warn" },
        };
        this.apiConfig = {
            name: 'Default API',
            baseURL: 'https://api.example.com',
            timeout: 5000,
            headers: { Authorization: "Bearer default" },
            retry: {},
            cache: {},
            responseType: 'json',
            withCredentials: false,
        };
        this.cachedConfig = {
            configureScript: () => 'default-config-script.js',
        };
        this.apiConfigSubscribers = [];
    }
    // Singleton instance getter
    static getInstance(): SecurityConfigurationService {
        if (!SecurityConfigurationService.instance) {
            SecurityConfigurationService.instance = new SecurityConfigurationService();
        }
        return SecurityConfigurationService.instance;
    }

    // Example methods to handle configuration
    getDefaultApiConfig(): ApiConfig {
        return {
            name: 'Default API',
            baseURL: 'https://api.example.com',
            timeout: 5000,
            headers: { Authorization: "Bearer default" },
            retry, cache, responseType, withCredentials,
        };
    }

    getAppName(): string {
        return "Security Application";
    }

    getPublicDefaultApiConfig(): ApiConfig {
        return this.getDefaultApiConfig();
    }

    getSnapshotConfig(): SnapshotConfig {
        return {
            snapshotEnabled: true,
            snapshotFrequency: 30, // in minutes
        };
    }

    setCachedConfig(config: LazyLoadScriptConfigImpl): void {
        this.cachedConfig = config;
    }

    getCachedConfig(): LazyLoadScriptConfigImpl {
        return this.cachedConfig;
    }

    getLazyLoadScriptConfig(): LazyLoadScriptConfigImpl {
        return this.cachedConfig;
    }

    getSystemConfigs(): SystemConfig {
        return {
            systemName: "Security System",
            version: "1.0.0",
        };
    }

    // Security configuration methods
    getSecurityConfig(): SecurityConfiguration {
        return this.securityConfig;
    }

    updateSecurityConfig(updatedConfig: Partial<SecurityConfiguration>): void {
        this.securityConfig = { ...this.securityConfig, ...updatedConfig };
        this.triggerSecurityConfigChange();
    }

    subscribeToSecurityConfigChanges(callback: (config: SecurityConfiguration) => void): void {
        // Implement subscription logic for security config
        // For example, push callback to a subscriber list
    }

    unsubscribeFromSecurityConfigChanges(callback: (config: SecurityConfiguration) => void): void {
        // Implement unsubscription logic for security config
        // For example, remove callback from a subscriber list
    }

    // Method to trigger security configuration change
    private triggerSecurityConfigChange(): void {
        const currentConfig = this.getSecurityConfig();
        this.apiConfigSubscribers.forEach((subscriber) => subscriber(currentConfig));
    }

    // Configuration management methods
    getApiConfig(): ApiConfig {
        return this.apiConfig;
    }

    getCurrentApiConfig(): ApiConfig {
        return this.apiConfig;
    }

    getApiVersionHeader(): string {
        return this.apiConfig.headers['Authorization'] ?? '';
    }

    getDataPath(): string {
        return "/path/to/data";
    }

    getConfigurationOptions(): object {
        return {
            option1: 'value1',
            option2: 'value2',
        };
    }

    // Subscription management for API config changes
    subscribeToApiConfigChanges(callback: (config: ApiConfig) => void): void {
        this.apiConfigSubscribers.push(callback);
    }

    unsubscribeFromApiConfigChanges(callback: (config: ApiConfig) => void): void {
        const index = this.apiConfigSubscribers.indexOf(callback);
        if (index >= 0) {
            this.apiConfigSubscribers.splice(index, 1);
        }
    }

    triggerApiConfigChange(): void {
        const currentConfig = this.getApiConfig();
        this.apiConfigSubscribers.forEach((subscriber) => subscriber(currentConfig));
    }

    updateApiConfig(updatedConfig: Partial<ApiConfig>): void {
        this.apiConfig = { ...this.apiConfig, ...updatedConfig };
        this.triggerApiConfigChange();
    }

    // Utility methods
    readConfigFile(): void {
        console.log('Reading configuration file...');
        // Simulate reading a configuration file and updating cachedConfig
        this.cachedConfig = { configureScript: 'new-config-script.js' };
    }

    getApiKey(): string {
        return "api-key-12345";
    }

    getAppId(): string {
        return "app-id-123";
    }

    getAppDescription(): string {
        return "This is an example app";
    }

    // Load configuration example
    loadConfig(): void {
        console.log('Loading configuration...');
        this.apiConfig = {
            name: 'Loaded API',
            baseURL: 'https://api.newexample.com',
            timeout: 3000,
            headers: { Authorization: "Bearer loaded-token" },
        };
    }

    // Save configuration example
    saveConfig(config: object): void {
        console.log('Saving configuration...');
        this.cachedConfig = { ...config } as LazyLoadScriptConfigImpl;
    }

    // Get the current config example
    getConfig(): object {
        return this.cachedConfig;
    }

    // Reset configuration example
    resetConfig(): void {
        console.log('Resetting configuration...');
        this.apiConfig = {
            name: 'Default API',
            baseURL: 'https://api.example.com',
            timeout: 5000,
            headers: { Authorization: "Bearer default" },
        };
        this.cachedConfig = {
            configureScript: 'default-config-script.js',
        };
    }
  }
  
  
    // Extend ConfigurationOptions interface to include security configurations
    interface ExtendedConfigurationOptions extends ConfigurationOptions {
      securityConfig: SecurityConfiguration;
    }
    
  // Update the ConfigurationService instance to include security configurations
  const configServiceInstance = ConfigurationService.getInstance();
  
  // Export the extended ConfigurationService and ConfigurationOptions interfaces
  export default SecurityConfigurationService;
  export { configServiceInstance };
  export type { ExtendedConfigurationOptions };
  