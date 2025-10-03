//todo better manager authorization actions here
// AuthorizationActions.ts

// Import necessary actions from other action modules
import { createAction } from "@reduxjs/toolkit";
import { DataActions } from '../projects/DataAnalysisPhase/DataActions';
// Import other action modules as needed

// Define authorization actions
export const AuthorizationActions = {
  // Data-related authorization actions
  dataAuthorization: {
    updateDataTitle: DataActions().updateDataTitle,
    updateDataDescription: DataActions().updateDataDescription,
    // Define other data-related actions as needed
  },
  
  // User-related authorization actions
  userAuthorization: {
    // Import user-related actions and define them here
  },
  
  // Team-related authorization actions
  teamAuthorization: {
    // Import team-related actions and define them here
  },



  // Phase-related authorization actions
  phaseAuthorization: {
    // Define phase-related actions here
  },

  // Communication features authorization actions
  communicationAuthorization: {
    // Define communication features actions here
  },

  // Collaboration tools authorization actions
  collaborationAuthorization: {
    // Define collaboration tools actions here
  },

  // Data analysis authorization actions
  dataAnalysisAuthorization: {
    // Define data analysis actions here
  },

  // Administration authorization actions
  administrationAuthorization: {
    // Define administration actions here
  },

  // Global access control authorization actions
  globalAccessControlAuthorization: {
    // Define global access control actions here
  },
  
  // Define other authorization actions for different modules
  
  // Centralized authorization actions
  // These can be used to manage overall access control
  // For example, granting or revoking specific permissions
  
  grantPermission: createAction<{ userId: string, permission: string }>('grantPermission'),
  revokePermission: createAction<{ userId: string, permission: string }>('revokePermission'),
};
