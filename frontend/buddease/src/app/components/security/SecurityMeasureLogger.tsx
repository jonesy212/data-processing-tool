// SecurityMeasureLogger.ts

import Logger from "../logging/Logger";
import { SecurityMeasure, SecurityMeasureType } from "./SecurityMeasures";
import { encryptData } from "./encryptedData";

// Extend the SecurityMeasureLogger interface to include logLevel
export interface SecurityMeasureLogger extends SecurityMeasure {
    type: SecurityMeasureType.Logger;
    logFilePath: string;
    logLevel: LogLevel; // Add logLevel property
  }
  
  // Define LogLevel enum for different logging levels
  export enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
  }
  
  // Function to implement logger security measures with customizable logging levels
  const implementLoggerSecurity = (loggerMeasure: SecurityMeasureLogger, loggerConfig: any) => {
    const { logFilePath, logLevel } = loggerMeasure;
  
    // Check if the logger is already initialized
    if (loggerConfig.initialized) {
      // Logger already initialized, update its configuration
      loggerConfig.logFilePath = logFilePath;
      loggerConfig.logLevel = logLevel;
      console.log(
        `Updated logger configuration - Log file: ${logFilePath}, Log level: ${logLevel}`
      );
    } else {
      // Initialize logger with the provided configuration
      loggerConfig.initialized = true;
      loggerConfig.logFilePath = logFilePath;
      loggerConfig.logLevel = logLevel;
      console.log(
        `Initialized logger with log file: ${logFilePath}, Log level: ${logLevel}`
      );
    }
  
    return loggerConfig;
  };

  export { implementLoggerSecurity };
