// toolbar/ToolbarActions.ts
import { createAction } from "@reduxjs/toolkit";
import { ParticipantData } from "@/app/pages/management/ParticipantManagementPage";
import { Theme } from "../libraries/ui/theme/Theme";
import { User } from "../users/User";

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
  toggleFeature: createAction<{ userId: User, feature: string, isEnabled: boolean }>("toggleFeature"),
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



  fetchParticipantData: createAction<{ userId: User, participantData: ParticipantData[] }>("fetchParticipantData"),

  showParticipantManagementModal: createAction<boolean>("showParticipantManagementModal"),
  // Add more toolbar actions as needed
  addParticipant: createAction<{ userId: User, participant: ParticipantData }>("addParticipant"),
  removeParticipant: createAction<{ userId: User, participantId: string }>("removeParticipant"),
};





