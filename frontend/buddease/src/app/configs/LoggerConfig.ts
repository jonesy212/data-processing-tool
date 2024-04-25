// LoggerConfig.ts
import {
  AnalyticsLogger,
  BugLogger,
  CommunityLogger,
  ContentLogger,
  ErrorLogger,
  ExchangeLogger,
  IntegrationLogger,
  PaymentLogger,
  SecurityLogger,
  TenantLogger,
  WebLogger,
} from "../components/logging/Logger";

// Define the LoggerConfig class
class LoggerConfig {
  private loggers: Record<string, any>;

  constructor() {
    // Initialize loggers with an empty object
    this.loggers = {};
  }

  // Method to add a logger to the configuration
  addLogger(loggerName: string, loggerInstance: any): void {
    // Check if the logger name is not already in use
    if (!this.loggers[loggerName]) {
      this.loggers[loggerName] = loggerInstance;
    } else {
      console.error(`Logger with name ${loggerName} already exists.`);
    }
  }

  // Method to get a logger by name
  getLogger(loggerName: string): any {
    // Check if the logger exists in the configuration
    if (this.loggers[loggerName]) {
      return this.loggers[loggerName];
    } else {
      console.error(`Logger with name ${loggerName} does not exist.`);
      return null;
    }
  }

  // Method to remove a logger from the configuration
  removeLogger(loggerName: string): void {
    // Check if the logger exists in the configuration
    if (this.loggers[loggerName]) {
      delete this.loggers[loggerName];
      console.log(`Logger ${loggerName} removed from the configuration.`);
    } else {
      console.error(`Logger with name ${loggerName} does not exist.`);
    }
  }

  // Method to get all loggers in the configuration
  getAllLoggers(): Record<string, any> {
    return this.loggers;
  }
}

// Example usage
const loggerConfig = new LoggerConfig();

// Add loggers to the configuration
loggerConfig.addLogger("WebLogger", WebLogger);
loggerConfig.addLogger("TenantLogger", TenantLogger);
loggerConfig.addLogger("AnalyticsLogger", AnalyticsLogger);
loggerConfig.addLogger("PaymentLogger", PaymentLogger);
loggerConfig.addLogger("SecurityLogger", SecurityLogger);
loggerConfig.addLogger("ContentLogger", ContentLogger);
loggerConfig.addLogger("IntegrationLogger", IntegrationLogger);
loggerConfig.addLogger("ErrorLogger", ErrorLogger);
loggerConfig.addLogger("ExchangeLogger", ExchangeLogger);
loggerConfig.addLogger("CommunityLogger", CommunityLogger);
loggerConfig.addLogger("BugLogger", BugLogger);

// Get a specific logger from the configuration
const webLogger = loggerConfig.getLogger("WebLogger");
if (webLogger) {
  console.log("Found WebLogger:", webLogger);
}

// Remove a logger from the configuration
loggerConfig.removeLogger("WebLogger");

// Get all loggers in the configuration
const allLoggers = loggerConfig.getAllLoggers();
console.log("All Loggers:", allLoggers);

export default LoggerConfig;