// ToolbarActions.ts
// toolbar/ToolbarActions.ts
import { Theme } from "@/core/libraries/ui/theme/Theme";
import { ParticipantData } from "@/core/pages/management/ParticipantManagementPage";
import { User } from "@/core/users/User";
import { createAction } from "@reduxjs/toolkit";

export const ToolbarActions = {
  // General Toolbar Actions
  updateSelectedOption: createAction<string>("updateSelectedOption"),
  clearSelectedOption: createAction("clearSelectedOption"),

  // Toolbar Actions
  enableVideoRecording: createAction("enableVideoRecording"),
  disableVideoRecording: createAction("disableVideoRecording"),
  enableVideoStreaming: createAction("enableVideoStreaming"),
  disableVideoStreaming: createAction("disableVideoStreaming"),

  enableQualitySettings: createAction("enableQualitySettings"),
  disableQualitySettings: createAction("disableQualitySettings"),

  startScreenSharing: createAction("startScreenSharing"),
  stopScreenSharing: createAction("stopScreenSharing"),

  
  // Feature Actions
  toggleFeature: createAction<{ 
    userId: User<any, any, any, any, any, any>, 
    feature: string, 
    isEnabled: boolean 
  }>("toggleFeature"),
  enableFeature: createAction<string>("enableFeature"),
  disableFeature: createAction<string>("disableFeature"),
  // Visibility Actions
  showToolbar: createAction("showToolbar"),
  hideToolbar: createAction("hideToolbar"),
  // State Actions
  resetToolbarState: createAction("resetToolbarState"),
  setToolbarSize: createAction<number>('setToolbarSize'),

  // Additional Feature Actions
  addFeature: createAction<string>("addFeature"),
  removeFeature: createAction<string>("removeFeature"),
  // Positioning Actions
  setPosition: createAction<{ x: number, y: number }>("setPosition"),
  // Theme Actions
  setTheme: createAction<{theme: Theme}>("setTheme"),
  // Customization Actions
  customizeToolbar: createAction<{ backgroundColor: string, textColor: string }>("customizeToolbar"),
  // Localization Actions
  setLanguage: createAction<string>("setLanguage"),
  // User Preferences Actions
  setUserPreferences: createAction<{ preferences: Record<string, any> }>("setUserPreferences"),



  fetchParticipantData: createAction<{ userId: User<any, any, any, any, any, any>, participantData: ParticipantData[] }>("fetchParticipantData"),

  showParticipantManagementModal: createAction<boolean>("showParticipantManagementModal"),
  // Add more toolbar actions as needed
  addParticipant: createAction<{ userId: User<any, any, any, any, any, any>, participant: ParticipantData }>("addParticipant"),
  removeParticipant: createAction<{ userId: User<any, any, any, any, any, any>, participantId: string }>("removeParticipant"),
};





