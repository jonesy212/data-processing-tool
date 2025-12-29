// PromptActions.ts
import { createAction } from "@reduxjs/toolkit";

export const PromptActions = {
  generatePromptsRequest: createAction<{
    documentContent: string;
    documentType: string;
    userQuery: string;
    userIdea: string;
  }>("generatePromptsRequest"),

  generatePromptsSuccess: createAction<{ prompts: string[] }>(
    "generatePromptsSuccess"
  ),
  generatePromptsFailure: createAction<{ error: string }>(
    "generatePromptsFailure"
  ),

  // Search actions
  searchPromptsRequest: createAction<string>("searchPromptsRequest"),
  searchPromptsSuccess: createAction<{ results: string[] }>(
    "searchPromptsSuccess"
  ),
  searchPromptsFailure: createAction<{ error: string }>("searchPromptsFailure"),

  // Batch actions
  batchGeneratePromptsRequest: createAction<{
    documentContents: string[];
    documentTypes: string[];
    userQueries: string[];
    userIdeas: string[];
  }>("batchGeneratePromptsRequest"),
  batchGeneratePromptsSuccess: createAction<{ prompts: string[][] }>(
    "batchGeneratePromptsSuccess"
  ),
  batchGeneratePromptsFailure: createAction<{ error: string }>(
    "batchGeneratePromptsFailure"
  ),

  // Project management actions
  startProjectPhase: createAction<{ phase: string }>("startProjectPhase"),
  completeProjectPhase: createAction<{ phase: string }>("completeProjectPhase"),
  updateProjectStatus: createAction<{ status: string }>("updateProjectStatus"),
  assignTask: createAction<{ taskId: string; assigneeId: string }>(
    "assignTask"
  ),
  markTaskAsComplete: createAction<{ taskId: string }>("markTaskAsComplete"),

 
  // Community-based actions
  createCommunity: createAction<{ name: string; description: string }>(
    "createCommunity"
  ),
  joinCommunity: createAction<{ communityId: string }>("joinCommunity"),
  leaveCommunity: createAction<{ communityId: string }>("leaveCommunity"),

  // Global collaboration actions
  startGlobalProject: createAction<{ projectName: string }>(
    "startGlobalProject"
  ),
  joinGlobalProject: createAction<{ projectId: string }>("joinGlobalProject"),
  leaveGlobalProject: createAction<{ projectId: string }>("leaveGlobalProject"),

  // User actions
  updateUserProfile: createAction<{ profileData: any }>("updateUserProfile"),
  deleteUserAccount: createAction("deleteUserAccount"),

  // Notification actions
  sendNotification: createAction<{ message: string; recipient: string }>(
    "sendNotification"
  ),

  // Analytics actions
  trackEvent: createAction<{ eventName: string; eventData: any }>("trackEvent"),

  // Authentication actions
  loginUser: createAction<{ email: string; password: string }>("loginUser"),
  logoutUser: createAction("logoutUser"),

  // Settings actions
  updateSettings: createAction<{ settingsData: any }>("updateSettings"),
  resetSettings: createAction("resetSettings"),

  // Integration actions
  integrateExternalService: createAction<{
    serviceName: string;
    serviceData: any;
  }>("integrateExternalService"),
  disconnectExternalService: createAction<{ serviceName: string }>(
    "disconnectExternalService"
  ),
};
