// configApi.ts
export interface Config {
    apiUrl: string;
    // Add other configuration properties as needed
  }

  
  // configApi.ts
export const defaultConfig: Config = {
    apiUrl: 'https://example.com/api',
    // Add default values for other configuration properties
  };

  
  // configApi.ts
class ConfigManager {
    private currentConfig: Config = { ...defaultConfig };
  
    getConfig(): Config {
      return this.currentConfig;
    }
  
    updateConfig(newConfig: Partial<Config>): void {
      this.currentConfig = { ...this.currentConfig, ...newConfig };
    }
  }
  
  export const configManager = new ConfigManager();
  