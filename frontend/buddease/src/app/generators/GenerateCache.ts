// generateCache.ts
import {
  useBrainstormingPhase,
  useMeetingsPhase,
  useProjectManagementPhase,
  useTeamBuildingPhase,
} from "../components/hooks/phaseHooks/CollaborationPhaseHooks";
import {
  authenticationPhaseHook,
  jobSearchPhaseHook,
  recruiterDashboardPhaseHook,
} from "../components/hooks/phaseHooks/PhaseHooks";
import { darkModeTogglePhaseHook, notificationBarPhaseHook } from "../components/hooks/userInterface/UIPhaseHooks";
import { backendDocumentConfig } from "../configs/BackendDocumentConfig";
import dataVersions from "../configs/DataVersionsConfig";
import frontendStructure from "../configs/FrontendStructure";
import userPreferences from "../configs/UserPreferences";
import userSettings from "../configs/UserSettings";

// Updated cache data structure based on the provided tree structure
export interface CacheData {
  lastUpdated: string;
  userPreferences: typeof userPreferences;
  userSettings: typeof userSettings;
  dataVersions: typeof dataVersions;
  frontendStructure: typeof frontendStructure;
  backendDocumentConfig: typeof backendDocumentConfig;
  // Add new top-level cache properties for UI phases
  notificationBarPhaseHook: typeof notificationBarPhaseHook;
  darkModeTogglePhaseHook: typeof darkModeTogglePhaseHook;
  authenticationPhaseHook: typeof authenticationPhaseHook;
  jobSearchPhaseHook: typeof jobSearchPhaseHook;
  recruiterDashboardPhaseHook: typeof recruiterDashboardPhaseHook;

  // Add new top-level cache properties for collaboration phases
  teamBuildingPhaseHook: typeof useTeamBuildingPhase;
  brainstormingPhaseHook: typeof useBrainstormingPhase;
  projectManagementPhaseHook: typeof useProjectManagementPhase;
  meetingsPhaseHook: typeof useMeetingsPhase;
  // Add more top-level cache properties as needed
  fileType: string;
 }

// Rest of the code remains unchanged...
