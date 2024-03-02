// VersionGenerator.tsx
import {
    NotificationTypeEnum,
    useNotification,
  } from "@/app/components/support/NotificationContext";
  import { TaskLogger } from "@/app/pages/logging/Logger";
  import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
  import Version from "./Version";
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
  
  class VersionGenerator {
    static async generateVersion(
      config: VersionGeneratorConfig
    ): Promise<Version> {
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
          NOTIFICATION_MESSAGES.Generators.GENERATE_VERSION_ID,
          new Date(),
          NotificationTypeEnum.GeneratedID
        );
  
        // Generate version object with standard and additional properties
        const versionInfo = {
          versionNumber: versionID, // Use the generated version ID
          timestamp: new Date().toISOString(), // Add timestamp for tracking
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
  
        return new Version(versionInfo);
      } catch (error) {
        console.error("Error generating version:", error);
        throw error; // Rethrow the error for handling at a higher level
      }
    }
  }
  
  export default VersionGenerator;
  
