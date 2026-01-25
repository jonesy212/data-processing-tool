// VersionGenerator.tsx

import type { NotificationTypeEnum } from '@/core/features/support/UnifiedNotificationTypes';

import { useNotification } from '@/core/state/context/NotificationContext';

import { handleApiErrorAndNotify } from "@/core/api/ApiData";
import getAppPath from "@/core/config/appStructure/appPath";
import UniqueIDGenerator from '@/core/generators/GenerateUniqueIds';
import { TaskLogger } from "@/core/logging/Logger";
import '@/core/versions/Version';
import { AxiosError } from "axios";

const { notify } = useNotification();  // Destructure notify from useNotification


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

export const getCurrentAppInfo = (): { versionNumber: string; appVersion: string } => { 
  // Retrieve appVersion and versionNumber using UniqueIDGenerator 
const appVersion = UniqueIDGenerator.generateAppVersion(); 
const versionNumber = UniqueIDGenerator.generateVersionNumber(); 
// Return an object containing the current appVersion and versionNumber return 
  return { versionNumber, 
    appVersion 
  }; 
};


class VersionGenerator {
  static async generateVersion(
    config: VersionGeneratorConfig
  ): Promise<VersionResult> {
    try {
      const { notify } = useNotification();
      
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

      // Success notification using object format
      notify({
        id: `version_generated_${versionID}_${Date.now()}`,
        message: `Generated version ID: ${versionID}`,
        data: {
          entityType: 'version',
          entityId: versionID,
          action: 'generate',
          versionInfo: {
            id: versionID,
            file: file,
            folder: folder,
            componentName: componentName,
            changeCount: Object.keys(changes).length,
            additionalPropertiesCount: Object.keys(additionalProperties).length
          },
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const,
        metadata: {
          generatorType: 'version',
          operation: 'version_generation',
          component: componentName
        }
      });

      // Generate appVersion and versionNumber using the provided generators
      const { versionNumber, appVersion } = getCurrentAppInfo();

      // Use getAppPath to get the app path with version information
      const appPathWithVersion = getAppPath(versionNumber, appVersion);

      // Generate version object with standard and additional properties
      const versionInfo = {
        appPathWithVersion,
        ...changes,
        ...additionalProperties,
        generatedAt: new Date().toISOString(),
        versionId: versionID,
        source: {
          file,
          folder,
          componentName
        }
      };

      // Log task completion event with updated notification format
      TaskLogger.logTaskCompleted(
        "existingTaskId",
        "Version Generation Task",
        (message: string, type: string, date: Date, id: string) => {
          notify({
            id: `task_completed_${id}_${Date.now()}`,
            message: message,
            data: {
              entityType: 'task',
              entityId: id,
              action: 'complete',
              taskType: 'version_generation',
              timestamp: new Date().toISOString()
            },
            timestamp: date,
            type: NotificationTypeEnum.OPERATION_SUCCESS,
            level: 'success' as const
          });
        }
      );

      const version = new Version({
        versionNumber: versionNumber || "1.0.0",
        appVersion: appVersion || "1.0.0",
        id: versionID,
        metadata: {
          generatedFrom: {
            file,
            folder,
            component: componentName
          },
          changes: changes,
          properties: properties
        }
      });

      // Final success notification
      notify({
        id: `version_generation_complete_${versionID}_${Date.now()}`,
        message: "Version generation completed successfully",
        data: {
          entityType: 'version',
          entityId: versionID,
          action: 'generation_complete',
          versionData: {
            versionNumber: version.versionNumber,
            appVersion: version.appVersion,
            appPath: appPathWithVersion
          },
          timestamp: new Date().toISOString()
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_SUCCESS,
        level: 'success' as const,
        metadata: {
          generatorType: 'version',
          status: 'complete',
          hasChanges: Object.keys(changes).length > 0
        }
      });

      return { version, info: versionInfo };
    } catch (error) {
      console.error("Error generating version:", error);

      // Enhanced error notification
      const { notify } = useNotification();
      const errorMessage = 'Failed to generate version';
      const axiosError = error as AxiosError;
      
      let userMessage = errorMessage;
      if (axiosError.response) {
        switch (axiosError.response.status) {
          case 400:
            userMessage = "Invalid version generation data";
            break;
          case 500:
            userMessage = "Server error during version generation";
            break;
        }
      }

      notify({
        id: `version_generation_error_${Date.now()}`,
        message: userMessage,
        data: {
          entityType: 'version',
          action: 'generation',
          config: {
            file: config.file,
            folder: config.folder,
            componentName: config.componentName
          },
          errorDetails: {
            originalError: axiosError.message,
            errorType: 'VERSION_GENERATION_ERROR',
            statusCode: axiosError.response?.status,
            timestamp: new Date().toISOString()
          }
        },
        timestamp: new Date(),
        type: NotificationTypeEnum.OPERATION_ERROR,
        level: 'error' as const,
        metadata: {
          generatorType: 'version',
          operation: 'generation',
          isError: true
        }
      });

      // Also call the existing error handler
      handleApiErrorAndNotify(
        error as AxiosError<unknown>,
        errorMessage,
        'GENERATE_VERSION_ERROR_ID'  // Using the correct message key
      );

      // Rethrow the error for handling at a higher level
      throw error;
    }
  }
}

export default VersionGenerator;