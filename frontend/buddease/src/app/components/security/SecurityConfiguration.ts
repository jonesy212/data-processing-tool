// SecurityConfiguration.ts

import { ApiConfig, ConfigurationOptions } from "@/app/configs/ConfigurationService";
import LoggerConfig from "@/app/configs/LoggerConfig";

// Define Security Configuration Interface
export interface SecurityConfiguration {
    headers: ApiConfig['headers']; // Security headers
    logger: Partial<LoggerConfig>; // Logger configuration
    // Add more security parameters as needed
  }
  
  // Extend ConfigurationService to handle security configurations
  class ConfigurationService {
      static getInstance() {
          if (!ConfigurationService.instance) {
              ConfigurationService.instance = new ConfigurationService();
          }
          return ConfigurationService.instance;

      }
      
    private static instance: ConfigurationService;
      private securityConfig: SecurityConfiguration;
      getInstance() {
          if(!ConfigurationService.instance) {
          ConfigurationService.instance = new ConfigurationService();
        }
        return ConfigurationService.instance;
      }
  
    private constructor() {
      // Initialize securityConfig with default values
      this.securityConfig = {
        headers: {},
        logger: {},
        // Initialize other security parameters
      };
    }
  
    // Method to retrieve the current security configuration
    getSecurityConfig(): SecurityConfiguration {
      return this.securityConfig;
    }
  
    // Method to update security configurations
    updateSecurityConfig(updatedConfig: Partial<SecurityConfiguration>): void {
      this.securityConfig = { ...this.securityConfig, ...updatedConfig };
      // Trigger callbacks to notify subscribers about the change
      this.triggerSecurityConfigChange();
    }
  
    // Method to subscribe to security config changes
    subscribeToSecurityConfigChanges(callback: (config: SecurityConfiguration) => void): void {
      // Add the callback function to the subscribers array
      // Implementation omitted for brevity
    }
  
    // Method to unsubscribe from security config changes
    unsubscribeFromSecurityConfigChanges(callback: (config: SecurityConfiguration) => void): void {
      // Remove the callback function from the subscribers array
      // Implementation omitted for brevity
    }
  
    // Private method to trigger security config change callbacks
    private triggerSecurityConfigChange(): void {
      const currentConfig = this.getSecurityConfig();
      // Notify all subscribers with the current config
      // Implementation omitted for brevity
    }
  
    // Other methods for managing security configurations
  }
  
  // Extend ConfigurationOptions interface to include security configurations
  interface ExtendedConfigurationOptions extends ConfigurationOptions {
    securityConfig: SecurityConfiguration;
  }
  
  // Update the ConfigurationService instance to include security configurations
  const configurationService = ConfigurationService.getInstance();
  
  // Export the extended ConfigurationService and ConfigurationOptions interfaces
  export default configurationService;
  export type { ExtendedConfigurationOptions };
  