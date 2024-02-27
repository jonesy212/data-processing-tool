import { createAction } from "@reduxjs/toolkit";

export const DataManagementPreferencesActions = {
  // Data Management
  enableBackup: createAction("dataManagementPreferences/enableBackup"),
  enableSync: createAction("dataManagementPreferences/enableSync"),
  enableEncryption: createAction("dataManagementPreferences/enableEncryption"),
  enableAutomaticPurging: createAction("dataManagementPreferences/enableAutomaticPurging"),
  enableCompression: createAction("dataManagementPreferences/enableCompression"),
  // Add new actions here
  enableFileVersioning: createAction("dataManagementPreferences/enableFileVersioning"),
  enableDataSynchronization: createAction("dataManagementPreferences/enableDataSynchronization"),
  enableDataExport: createAction("dataManagementPreferences/enableDataExport"),
  enableDataImport: createAction("dataManagementPreferences/enableDataImport"),
  enableRealTimeCollaboration: createAction("dataManagementPreferences/enableRealTimeCollaboration"),
  enableTaskManagement: createAction("dataManagementPreferences/enableTaskManagement"),
  enableCommunication: createAction("dataManagementPreferences/enableCommunication"),
  enableDocumentSharing: createAction("dataManagementPreferences/enableDocumentSharing"),
  enableIntegrationWithThirdPartyTools: createAction("dataManagementPreferences/enableIntegrationWithThirdPartyTools"),
  enableWorkflowAutomation: createAction("dataManagementPreferences/enableWorkflowAutomation"),
  enableUserPermissions: createAction("dataManagementPreferences/enableUserPermissions"),
  enableActivityLogging: createAction("dataManagementPreferences/enableActivityLogging"),
  enableNotifications: createAction("dataManagementPreferences/enableNotifications"),
  enableOfflineAccess: createAction("dataManagementPreferences/enableOfflineAccess"),
  enableUserFeedbackCollection: createAction("dataManagementPreferences/enableUserFeedbackCollection"),
  enableAnalytics: createAction("dataManagementPreferences/enableAnalytics"),
};
