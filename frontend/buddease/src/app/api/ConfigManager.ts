// ConfigManager.ts
import { handleApiError } from "@/app/api/ApiLogs";
import { sanitizeInput } from "@/app/components/crypto/SanitizationFunctions";
import { SharedConfig } from '@/config/BaseConfig';
import { NotificationTypeEnum, useNotification } from '@/app/context/NotificationContext';
import NOTIFICATION_MESSAGES from "@/app/features/support/NotificationMessages";
// Import any other necessary dependencies

export interface Config extends SharedConfig {
  apiUrl: string;
  apiKey: string;
  maxConnections: number;
  // Add other configuration properties as needed
}

const defaultConfig: Config = {
  apiUrl: "",
  apiKey: "",
  maxConnections: 0,
  apiEndpoint: "",
  id: ""
};

const defaultNotificationContext = {
  notify: () => {
    console.warn("Notification context is not available.");
  },
};


class ConfigManager {
  private currentConfig: Config = { ...defaultConfig };
  private notificationContext = useNotification() || defaultNotificationContext;

  getConfig(): Config {
    return this.currentConfig;
  }

  getConfigsData(): Config {
    try {
      return this.currentConfig;
    } catch (error: any) {
      handleApiError(error, "Error retrieving config data");
      return defaultConfig;
    }
  }

  updateConfig(newConfig: Partial<Config>): void {
    // Sanitize new configuration data before updating
    const sanitizedConfig = this.sanitizeConfig(newConfig);

    this.currentConfig = { ...this.currentConfig, ...sanitizedConfig };
    // Notify about config update
    this.notificationContext.notify(
      "configId",
      "Config Updated",
      "API configuration updated successfully.",
      new Date,
      NOTIFICATION_MESSAGES.Config.CONFIG_UPDATED,
      NotificationTypeEnum.CONFIGURATION
    );
  }

  rollbackConfig(): void {
    this.currentConfig = { ...defaultConfig };
    // Notify about config rollback
    this.notificationContext.notify(
      "config rollback",
      "Config Rolled Back",
      "API configuration rolled back to default.",
      new Date,
      NOTIFICATION_MESSAGES.Config.CONFIG_ROLLEDBACK,
      NotificationTypeEnum.INFO
   
    );
  }

  // Method to validate configuration data
  
 validateConfig(newConfig: Partial<Config>): string[] {
  const errors: string[] = [];

  // Validate apiKey
  if (newConfig.apiKey === undefined || newConfig.apiKey.trim() === '') {
    errors.push('API key is required.');
  }

  // Validate apiUrl
  if (newConfig.apiUrl === undefined || newConfig.apiUrl.trim() === '') {
    errors.push('API URL is required.');
  }

  // Validate maxConnections
  if (
    newConfig.maxConnections !== undefined &&
    (isNaN(newConfig.maxConnections) ||
      newConfig.maxConnections < 1 ||
      newConfig.maxConnections > 10)
  ) {
    errors.push('Max connections must be a number between 1 and 10.');
  }

  // Add more validation rules as needed for other configuration properties

  return errors;
}

  // Method to sanitize configuration data
  sanitizeConfig(config: Partial<Config>): Partial<Config> {
    const sanitizedConfig: Partial<Config> = {};

    // Sanitize each configuration property
    for (const key in config) {
      if (Object.prototype.hasOwnProperty.call(config, key)) {
        // Type assertion to inform TypeScript about the key type
        const configKey = key as keyof Partial<Config>;
        if(!config[configKey]) continue;
        // Sanitize each property value before updating the configuration
        if (configKey === 'apiKey') {
          sanitizedConfig[configKey] = sanitizeInput(
            config[configKey] !== undefined ? String(config[configKey]) : ""
          );
        }
      }
    }

    return sanitizedConfig;
  }

  // Method to handle API errors
  handleApiError(error: Error): void {
    // Handle API errors using the provided function
    handleApiError(error, "API operation failed.");
  }
}

export const configManager = new ConfigManager();
