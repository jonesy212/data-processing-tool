// VersionGenerator.tsx
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import { TaskLogger } from "@/app/pages/logging/Logger";
import { AxiosError } from "axios";
import getAppPath from "../../../appPath";
import { handleApiErrorAndNotify } from "../api/ApiData";
import NOTIFICATION_MESSAGES from "../components/support/NotificationMessages";
import Version from "../components/versions/Version";
import UniqueIDGenerator from "./GenerateUniqueIds";
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
      const appVersion = UniqueIDGenerator.generateAppVersion();
      const versionNumber = UniqueIDGenerator.generateVersionNumber();

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
              type, date, NotificationTypeEnum.TaskBoardID);
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
        const errorMessage = 'Failed to generate version';
        handleApiErrorAndNotify(
          error as AxiosError<unknown>,
          errorMessage,
          'GenerateVersionErrorId'
        );
  
        // Rethrow the error for handling at a higher level
        throw error;
      }
    }
  }
  
  export default VersionGenerator;
  
