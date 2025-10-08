// VersionGenerator.tsx
import { Attachment } from '@/app/documents/attachment/Attachment';
import { StructuredMetadata } from "@/config/StructuredMetadata";
import { UnifiedMetaDataOptions } from "@/server/database/MetaDataOptions";

import { apiNotificationMessages, handleApiErrorAndNotify } from "@/app/api/ApiData";
import { NotificationTypeEnum, useNotification } from '@/app/context/NotificationContext';
import DocumentPermissions from '@/app/documents/DocumentPermissions';
import UniqueIDGenerator from "@/app/generators/GenerateUniqueIds";
import { TaskLogger } from "@/app/libraries/logging/Logger";
import { BaseData } from '@/app/models/data/Data';
import { EventManager, InitializedState } from "@/app/projects/DataAnalysisPhase/DataProcessing/DataStore";
import { Snapshot } from "@/app/snapshots/Snapshot";
import { createLatestVersion } from "@/app/versions/createLatestVersion";
import { Version } from "@/app/versions/Version";
import { ExtendedVersionData } from '@/app/versionsVersionData';
import getAppPath from "@/config/appStructure/appPath";
import { AxiosError } from "axios";

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



interface VersionNotificationMessages {
  FETCH_EXCHANGE_DATA_ERROR: keyof typeof apiNotificationMessages; // Ensure it matches your actual notification message ID
  GENERATE_VERSION_ERROR_ID: keyof typeof apiNotificationMessages;
  // Add more notification IDs as needed
}


interface VersionResult<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> {
  version: Version<T, K>;
  versionInfo: ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
  static async generateVersion<  
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
  >(
    config: VersionGeneratorConfig
  ): Promise<VersionResult<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
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
        "versionGenerator", // id
        message, // content
        null, // notificationMessage (set to null as per your interface)
        new Date(), // date
        NotificationTypeEnum.GENERATED_ID, // type
        undefined, // notificationType (optional)
        undefined, // options (optional)
        undefined // userName (optional)
      );

      // Generate appVersion and versionNumber using the provided generators
      const { versionNumber, appVersion } = getCurrentAppInfo();

      // Use getAppPath to get the app path with version information
      const appPathWithVersion = getAppPath(versionNumber, appVersion);

      // Generate version object with standard and additional properties
      const versionInfo: ExtendedVersionData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> = {
         // Required fields with defaults
        userId: config.properties.userId ?? 'system', // Provide fallback for userId
        createdAt: new Date(),
        updatedAt: new Date(),
        versionNumber: '0.0.0', // Default version
        appVersion: '1.0.0', // Default app version
        
        appPathWithVersion,
        ...changes, // Merge changes into version properties
        ...additionalProperties, // Merge additional properties

        // Ensure all required fields are present
        ...(additionalProperties.userId ? {} : { userId: 'system' })
  
      };

      // Log task completion event
      TaskLogger.logTaskCompleted(
        "existingTaskId",
        "Version Generation Task",
        "TaskSuccess" as NotificationType,
        (message: string, type: string, date: Date, id: string) => {
          notify(
            id, // First parameter is id
            message, // Second is content
            null, // Third is notificationMessage
            date, // Fourth is date
            NotificationTypeEnum.TASK_BOARD_ID, // Fifth is type
            undefined, // Sixth is notificationType (optional)
            undefined, // Seventh is options (optional)
            undefined // Eighth is userName (optional)
          );
        }
      );

      const version = new Version<BaseData<any>>({
        id: 1,
        versionNumber: "1.0.0",
        appVersion: "1.0.0",
        versionData: null,
        buildVersions: undefined,
        isActive: true,
        releaseDate: new Date(),
        major: 1,
        minor: 0,
        patch: 0,
        name: "Version 1",
        url: "https://example.com/version1",
        documentId: "documentId",
        draft: false,
        userId: versionInfo.userId, // Now guaranteed to be string
        content: "Initial content",
        description: "Initial description",
        buildNumber: "1",
        metadata: {
          currentMeta: {
            baseConfig: {
              id: "1", // Example ID
              apiEndpoint: "https://api.example.com", // Example API endpoint
              apiKey: undefined, // Example API key (optional)
              timeout: 5000, // Example timeout in milliseconds
              retryAttempts: 3, // Example retry attempts
              name: "Project Name", // Example project name
              description: "Project Description", // Example project description
              latestVersion: createLatestVersion<T, K>(), // Example latest version
              category: "Example Category", // Example category
              timestamp: new Date(), // Current timestamp
              createdBy: "user@example.com", // Example created by
              metadata: {} as UnifiedMetaDataOptions<
                T,
                BaseData<any, any, StructuredMetadata<any, any>, Attachment>,
                StructuredMetadata<T, K>,
                never
              >, // Example metadata
              initialState: {} as InitializedState<T, K>, // Example initial state
              meta: {} as StructuredMetadata<T, K>, // Example meta
              mappedSnapshot: new Map<string, Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>>(), // Example mapped snapshot
              events: {} as EventManager<T, K>, // Example events
            },
            metadataEntries: {},
          },
        },
        versions: null,
        checksum: "checksum",
        parentId: null,
        parentType: "document",
        parentVersion: "1.0.0",
        parentTitle: "Initial Release",
        parentContent: "Parent content",
        parentName: "Parent Document",
        parentUrl: "https://example.com/parent-document",
        parentChecksum: "parentChecksum",
        parentAppVersion: "1.0.0",
        parentVersionNumber: "1",
        parentMetadata: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
        isLatest: false,
        isPublished: false,
        publishedAt: null,
        source: "internal system",
        status: "active",
        workspaceId: "workspace123",
        workspaceName: "Development Workspace",
        workspaceType: "development",
        workspaceUrl: "https://example.com/workspace123",
        workspaceViewers: [],
        workspaceAdmins: [],
        workspaceMembers: [],
        data: null,
        _structure: {},
        versionHistory: {
          versionData: {},
          latestVersion: createLatestVersion<T, K>(),
          history: [],
          timestamp: new Date()
        },
        structureData: "",
        publishedBy: "",
        lastModifiedBy: "",
        lastModifiedAt: "",
        rootId: "",
        branchId: "",
        lockedBy: "",
        lockedAt: new Date(),
        isArchived: false,
        isDeleted: false,
        isLocked: false,
        archivedBy: "",
        archivedAt: new Date(),
        tags: {},
        categories: [],
        permissions: {} as DocumentPermissions,
        collaborators: [],
        comments: [],
        reactions: [],
        changes: [],
        attachments: [],
       
        // getVersionNumber: () => "1.0.0",
        // updateStructureHash: async () => {},
        // setStructureData: (newData: string) => {},
        // hash: (value: string) => value,
        // currentHash: "",
        // structureData: "",
        // calculateHash: () => "hash",
      });

      return { version, versionInfo };
    } catch (error) {
      console.error("Error generating version:", error);

      // Handle the error and notify
      const errorMessage = 'Failed to generate version';
      const errorKey: keyof VersionNotificationMessages = 'GENERATE_VERSION_ERROR_ID';

      handleApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        errorKey
      );

      // Rethrow the error for handling at a higher level
      throw error;
    }
  }
}
  
  export default VersionGenerator;
  export { getCurrentAppInfo };
