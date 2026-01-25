// SecurityMeasures.ts
security/SecurityMeasures
import { createHeaders } from "@/core/api/ApiClient";
import type { SecurityMeasure, SecurityMeasureType } from '@/core/typings/securityMeasureTypes';
import { SecurityMeasureHeader, SecurityMeasureLogger } from '@/core/typings/securityMeasureTypes';



// Action to implement security measures
const requestHeaders = createHeaders();
export const implementSecurityMeasures = (
  securityMeasures: SecurityMeasure[]
): void => {
  securityMeasures.forEach((measure) => {
    switch (measure.type) {
      case SecurityMeasureType.Header:
        implementHeaderSecurity(
          measure as SecurityMeasureHeader,
          requestHeaders
        );
        break;
      case SecurityMeasureType.Logger:
        implementLoggerSecurity(
          measure as SecurityMeasureLogger,
          requestHeaders
        );
        break;
      // Add cases for additional security measure types as needed
      default:
        console.warn(`Unknown security measure type: ${measure.type}`);
    }
  });
};

/**
 * Function to implement header security measures.
 * @param {Object} headerMeasure - The security measure header object.
 * @param {Object} requestHeaders - The headers of the request.
 * @returns {Object} - The updated request headers.
 */
const implementHeaderSecurity = (
  headerMeasure: SecurityMeasureHeader,
  requestHeaders:
    | { [x: string]: any; hasOwnProperty: (arg0: any) => any }
    | undefined
) => {
  const { name, value } = headerMeasure;

  // Check if requestHeaders is defined
  if (requestHeaders) {
    // Check if the header already exists in the request headers
    if (requestHeaders.hasOwnProperty(name)) {
      // Header already exists, update its value
      requestHeaders[name] = value;
      console.log(`Header ${name} updated with value: ${value}`);
    } else {
      // Header doesn't exist, add it to the request headers
      requestHeaders[name] = value;
      console.log(`Added header ${name}: ${value}`);
    }
  } else {
    // requestHeaders is undefined, log an error
    console.error("requestHeaders is undefined, cannot add or update header.");
  }

  return requestHeaders;
};

/**
 * Function to implement logger security measures.
 * @param {Object} loggerMeasure - The security measure logger object.
 * @param {Object} loggerConfig - The current logger configuration.
 * @returns {Object} - The updated logger configuration.
 */
const implementLoggerSecurity = (loggerMeasure: any, loggerConfig: any) => {
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

// Example usage
const securityHeader: SecurityMeasureHeader = {
  id: "1",
  type: SecurityMeasureType.Header,
  description: "Add X-Content-Type-Options header",
  name: "X-Content-Type-Options",
  value: "nosniff",
  appliesTo: 'both',
  enabled: true,
  priority: 'low'
};

// Call the function with the security header
implementHeaderSecurity(securityHeader, requestHeaders);

#TODO REMOVE
// Total Issues : 4932
Critical     : 125
High         : 401
Medium       : 2890
Low          : 1516