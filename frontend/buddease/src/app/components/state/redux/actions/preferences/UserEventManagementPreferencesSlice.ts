// UserDataManagementPreferencesActions.ts
import { createSlice } from "@reduxjs/toolkit";

interface UserDataManagementPreferencesState {
  backupEnabled: boolean;
  syncEnabled: boolean;
  encryptionEnabled: boolean;
  automaticPurgingEnabled: boolean;
  compressionEnabled: boolean;
  fileVersioningEnabled: boolean;
  dataSynchronizationEnabled: boolean;
  dataExportEnabled: boolean;
  dataImportEnabled: boolean;
  realTimeCollaborationEnabled: boolean;
  taskManagementEnabled: boolean;
  communicationEnabled: boolean;
  documentSharingEnabled: boolean;
  integrationWithThirdPartyToolsEnabled: boolean;
  workflowAutomationEnabled: boolean;
  userPermissionsEnabled: boolean;
  activityLoggingEnabled: boolean;
  offlineAccessEnabled: boolean;
  notificationsEnabled: boolean;
  userFeedbackCollectionEnabled: boolean;
  analyticsEnabled: boolean;
}

const initialState: UserDataManagementPreferencesState = {
  backupEnabled: false,
  syncEnabled: false,
  encryptionEnabled: false,
  automaticPurgingEnabled: false,
  compressionEnabled: false,
  fileVersioningEnabled: false,
  dataSynchronizationEnabled: false,
  dataExportEnabled: false,
  dataImportEnabled: false,
  realTimeCollaborationEnabled: false,
  taskManagementEnabled: false,
  communicationEnabled: false,
  documentSharingEnabled: false,
  integrationWithThirdPartyToolsEnabled: false,
  workflowAutomationEnabled: false,
  userPermissionsEnabled: false,
  activityLoggingEnabled: false,
  offlineAccessEnabled: false,
  notificationsEnabled: false,
  userFeedbackCollectionEnabled: false,
  analyticsEnabled: false
};

const userDataManagementPreferencesSlice = createSlice({
  name: "userDataManagementPreferences",
  initialState,
  reducers: {
    enableBackup: (state) => {
      state.backupEnabled = true;
    },
    enableSync: (state) => {
      state.syncEnabled = true;
    },
    enableEncryption: (state) => {
      state.encryptionEnabled = true;
    },
    enableAutomaticPurging: (state) => {
      state.automaticPurgingEnabled = true;
    },
    enableCompression: (state) => {
      state.compressionEnabled = true;
    },
    // Add new methods here
    enableFileVersioning: (state) => {
      state.fileVersioningEnabled = true;
    },
    enableDataSynchronization: (state) => {
      state.dataSynchronizationEnabled = true;
    },
    enableDataExport: (state) => {
      state.dataExportEnabled = true;
    },
    enableDataImport: (state) => {
      state.dataImportEnabled = true;
    },
    enableRealTimeCollaboration: (state) => {
      state.realTimeCollaborationEnabled = true;
    },
    enableTaskManagement: (state) => {
      state.taskManagementEnabled = true;
    },
    enableCommunication: (state) => {
      state.communicationEnabled = true;
    },
    enableDocumentSharing: (state) => {
      state.documentSharingEnabled = true;
    },
    enableIntegrationWithThirdPartyTools: (state) => {
      state.integrationWithThirdPartyToolsEnabled = true;
    },
    enableWorkflowAutomation: (state) => {
      state.workflowAutomationEnabled = true;
    },
    enableUserPermissions: (state) => {
      state.userPermissionsEnabled = true;
    },
    enableActivityLogging: (state) => {
      state.activityLoggingEnabled = true;
    },
    enableNotifications: (state) => {
      state.notificationsEnabled = true;
    },
    enableOfflineAccess: (state) => {
      state.offlineAccessEnabled = true;
    },
    enableUserFeedbackCollection: (state) => {
      state.userFeedbackCollectionEnabled = true;
    },
    enableAnalytics: (state) => {
      state.analyticsEnabled = true;
    },
  },
});

export const {
  // Data Management
  enableBackup,
  enableSync,
  enableEncryption,
  enableAutomaticPurging,
  enableCompression,
  enableFileVersioning,
  enableDataSynchronization,
  enableDataExport,
  enableDataImport,

  // Collaboration
  enableRealTimeCollaboration,
  enableTaskManagement,
  enableCommunication,
  enableDocumentSharing,
  enableIntegrationWithThirdPartyTools,
  enableWorkflowAutomation,

  // Security & Permissions
  enableUserPermissions,

  // Monitoring & Logging
  enableActivityLogging,
  enableNotifications,

  // User Experience
  enableOfflineAccess,
  enableUserFeedbackCollection,

  // Analytics
  enableAnalytics,
} = userDataManagementPreferencesSlice.actions;

export default userDataManagementPreferencesSlice.reducer;
