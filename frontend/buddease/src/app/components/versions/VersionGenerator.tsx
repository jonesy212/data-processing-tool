// VersionGenerator.tsx
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { TaskLogger } from "@/app/pages/logging/Logger";
import { AxiosError } from "axios"; 
import Version from "./Version";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import getAppPath from "../../../../appPath";
import { handleApiErrorAndNotify } from "@/app/api/ApiData";
 const { notify } = useNotification();

interface VersionGeneratorConfig {
  getData: () => Promise<any>; // Callback to retrieve real-time data
  determineChanges: (data: any) => Record<string, any>; // Callback to determine changes based on data
  additionalProperties: Record<string, any>; // Additional properties for the version object
  // Add parameters for dynamic information
  file: string;
  folder: string;
  componentName: string;
  properties: Record<string, any>;
}

interface VersionResult {
  version: Version;
  info: any; // Replace 'any' with the type of versionInfo object if available
}

// Define the getCurrentAppInfo function outside the VersionGenerator class
const getCurrentAppInfo = (): { versionNumber: string; appVersion: string } => {
  // Retrieve appVersion and versionNumber using UniqueIDGenerator
  const appVersion = UniqueIDGenerator.generateAppVersion();
  const versionNumber = UniqueIDGenerator.generateVersionNumber();

  // Return an object containing the current appVersion and versionNumber
  return {
    versionNumber,
    appVersion,
  };
};

class VersionGenerator {
  static async generateVersion(
    config: VersionGeneratorConfig
  ): Promise<VersionResult> {
    try {
      // Retrieve real-time data
      const data = await config.getData();

      // Use dynamic information provided in the config
      const {
        file,
        folder,
        componentName,
        properties,
        determineChanges,
        additionalProperties,
      } = config;

      // Determine changes based on the retrieved data
      const changes = determineChanges(data);

      // Generate a unique version ID
      const versionID = `version_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;

      // Notify about the generated version ID
      const message = `Generated version ID: ${versionID}`;
      notify(
        message,
        "versionGenerator",
        NOTIFICATION_MESSAGES.Generators.GENERATE_VERSION_ID,
        new Date(),
        NotificationTypeEnum.GeneratedID
      );

      // Generate appVersion and versionNumber using the provided generators
      const { versionNumber, appVersion } = getCurrentAppInfo();

      // Use getAppPath to get the app path with version information
      const appPathWithVersion = getAppPath(versionNumber, appVersion);
      // Generate version object with standard and additional properties
      const versionInfo = {
        appPathWithVersion,
        ...changes, // Merge changes into version properties
        ...additionalProperties, // Merge additional properties
      };

      // Log task completion event
      TaskLogger.logTaskCompleted(
        "existingTaskId", // Provide existing task ID if available, otherwise pass null or an empty string
        "Version Generation Task",
        (message, type, date, id) => {
          notify(
            message,
            "", //todo update
            type,
            date,
            NotificationTypeEnum.TaskBoardID
          );
        }
      );

      const version = new Version({
        versionNumber: "1.0.0",
        appVersion: "1.0.0",
      });

      return { version, info: versionInfo };
    } catch (error) {
      console.error("Error generating version:", error);

      // Handle the error and notify
      const errorMessage = "Failed to generate version";
      handleApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        "GenerateVersionErrorId"
      );

      // Rethrow the error for handling at a higher level
      throw error;
    }
  }

  static async generateVersionFromFile(
    file: string,
    folder: string,
    componentName: string,
    properties: Record<string, any>, // Define properties dynamically
    additionalProperties: Record<string, any>, // Define additional properties dynamically
    config: VersionGeneratorConfig
  ): Promise<Version> {
    try {
      // Retrieve real-time data
      const data = await config.getData();

      // Determine changes based on the retrieved data
      const changes = config.determineChanges(data);

      // Generate a unique version ID
      const versionID = `version_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;

      // Notify about the generated version ID
      const message = `Generated version ID: ${versionID}`;
      notify(
        versionID,
        message,
        NOTIFICATION_MESSAGES.Generators.GENERATE_VERSION_ID,
        new Date(),
        NotificationTypeEnum.GeneratedID
      );
 

      // Log task completion event
      TaskLogger.logTaskCompleted(
        "existingTaskId", // Provide existing task ID if available, otherwise pass null or an empty string
        "Version Generation Task",
        (message, type, date, id) => {
          notify(id, message, type, date, NotificationTypeEnum.TaskBoardID);
        }
      );

      const { versionNumber, appVersion } = getCurrentAppInfo();
      return new Version({ versionNumber, appVersion });
    } catch (error) {
      console.error("Error generating version:", error);
      throw error; // Rethrow the error for handling at a higher level
    }
  }
}

export default VersionGenerator;
export { getCurrentAppInfo };
