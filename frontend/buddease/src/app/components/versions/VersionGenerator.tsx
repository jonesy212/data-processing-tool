// VersionGenerator.tsx
import { handleApiErrorAndNotify } from "@/app/api/ApiData";
import { TaskLogger } from "@/app/components/logging/Logger";
import {
  NotificationTypeEnum,
  useNotification,
} from "@/app/components/support/NotificationContext";
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { AxiosError } from "axios";
import getAppPath from "../../../../appPath";
import NOTIFICATION_MESSAGES from "../support/NotificationMessages";
import Version, { version as versionImpl } from "./Version";
import VersionImpl from "./Version";
import { T, K } from "../models/data/dataStoreMethods";
import DocumentPermissions from "@/app/components/documents/DocumentPermissions";
import { backend, backendStructure } from "@/app/configs/appStructure/BackendStructure";
import { frontendStructure } from "@/app/configs/appStructure/FrontendStructure";

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
  version: Version<T, K<T>>;
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

// info@theneptune.com

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
        NotificationTypeEnum.TaskBoardID,
        (message: string, type: string, date: Date, id: string) => {
          notify(
            message,
            "", //todo update
            type,
            date,
            NotificationTypeEnum.TaskBoardID
          );
        }
      );


      
      const version = new VersionImpl({
        ...versionImpl,
        
        id: 0, // Provide a default value for the missing 'id' property
        versionNumber: "1.0.0",
        appVersion: "1.0.0",
        content: "", // Provide a default value for the missing 'content' property
        data: [], // Provide a default value for the missing 'data' property
        name: "", // Provide a default value for the missing 'name' property
        url: "", // Provide a default value for the missing 'url' property

        isDeleted: false,
        publishedBy: "",
        lastModifiedBy: "",
        lastModifiedAt: new Date(),
        rootId: "",
        branchId: "",
        isLocked: true,
        lockedBy: "",
        lockedAt: new Date(),
        isArchived: false,
        archivedBy: "",
        archivedAt: new Date(),
        tags: {},
        categories: [],
        permissions: new DocumentPermissions(false, false),
        collaborators: [],
        comments: [],
        reactions: [],
        changes: [],
        attachments: [],
      });

      return { version, info: versionInfo };
    } catch (error) {
      console.error("Error generating version:", error);

      // Handle the error and notify
      const errorMessage = "Failed to generate version";
      handleApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        `${NOTIFICATION_MESSAGES.Errors.GENERATE_VERSION_ERROR}` as keyof DynamicNotificationMessage
      );

      // Rethrow the error for handling at a higher level
      throw error;
    }
  }

  static async generateVersionFromFile(
    file: string,
    folder: string,
    componentName: string,
    properties: Record<string, any>,
    additionalProperties: Record<string, any>,
    config: VersionGeneratorConfig
  ): Promise<Version<T, K<T>>> {
    try {
      const data = await config.getData();
      const changes = config.determineChanges(data);

      const versionID = `version_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;

      const message = `Generated version ID: ${versionID}`;
      notify(
        versionID,
        message,
        NOTIFICATION_MESSAGES.Generators.GENERATE_VERSION_ID,
        new Date(),
        NotificationTypeEnum.GeneratedID
      );

      TaskLogger.logTaskCompleted(
        "existingTaskId",
        "Version Generation Task",
        NotificationTypeEnum.TaskBoardID,
        (message: string, type: string, date: Date, id: string) => {
          notify(id, message, type, date, NotificationTypeEnum.TaskBoardID);
        }
      );

      const { versionNumber, appVersion } = getCurrentAppInfo();
      return new VersionImpl({
        ...versionImpl,
        versionNumber,
        appVersion,
        id: 0, // Provide a default value for id
        content: "", // Provide a default value for content
        data: [], // Provide a default value for data
        name: "", // Provide a default value for name
        url: "", // Provide a default value for url
        isDeleted: false,
        publishedBy: "",
        lastModifiedBy: "",
        lastModifiedAt: new Date(),
        rootId: "",
        branchId: "",
        isLocked: true,
        lockedBy: "",
        lockedAt: new Date(),
        isArchived: false,
        archivedBy: "",
        archivedAt: new Date(),
        tags: {},
        categories: [],
        permissions: new DocumentPermissions(false, false),
        collaborators: [],
        comments: [],
        reactions: [],
        changes: [],
        attachments: [],
        buildVersions: {
          data: data,
          backend: backendStructure,
          frontend: frontendStructure,
         
        }
      });
    } catch (error) {
      console.error("Error generating version:", error);
      throw error;
    }
  }
}

export default VersionGenerator;
export { getCurrentAppInfo };