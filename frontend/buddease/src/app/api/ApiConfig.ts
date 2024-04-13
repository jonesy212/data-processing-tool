import { handleApiError } from "@/app/api/ApiLogs";
import { sanitizeInput } from "../components/security/SanitizationFunctions";
import { useNotification } from "../components/support/NotificationContext";

// Import any other necessary dependencies

export interface Config {
  apiUrl: string;
  // Add other configuration properties as needed
}

const defaultConfig: Config = {
  apiUrl: "",
};

class ConfigManager {
  private currentConfig: Config = { ...defaultConfig };
  private notificationContext = useNotification();

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
      "Config Updated",
      "API configuration updated successfully.",
      "success"
    );
  }

  rollbackConfig(): void {
    this.currentConfig = { ...defaultConfig };
    // Notify about config rollback
    this.notificationContext.notify(
      "Config Rolled Back",
      "API configuration rolled back to default.",
      "info"
    );
  }

  // Method to validate configuration data
  validateConfig(newConfig: Partial<Config>): string[] {
    const errors: string[] = [];

    // Implement validation rules for the new configuration data
    // Add validation logic as needed

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
        // Sanitize each property value before updating the configuration
        sanitizedConfig[configKey] = sanitizeInput(config[configKey] ?? "");
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
