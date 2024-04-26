// generateCache.ts
import { RealtimeData } from "../../../models/realtime/RealtimeData";
import useRealtimeData from "../components/hooks/commHooks/useRealtimeData";
import {
  useBrainstormingPhase,
  useMeetingsPhase,
  useProjectManagementPhase,
  useTeamBuildingPhase,
} from "../components/hooks/phaseHooks/CollaborationPhaseHooks";
import {
  authenticationPhaseHook,
  dataAnalysisPhaseHook,
  generalCommunicationFeaturesPhaseHook,
  ideationPhaseHook,
  jobSearchPhaseHook,
  productBrainstormingPhaseHook,
  productLaunchPhaseHook,
  recruiterDashboardPhaseHook,
  teamCreationPhaseHook,
} from "../components/hooks/phaseHooks/PhaseHooks";
import {
  darkModeTogglePhaseHook,
  notificationBarPhaseHook,
} from "../components/hooks/userInterface/UIPhaseHooks";
import { Data } from "../components/models/data/Data";
import { sanitizeCallback, sanitizeInitialData } from "../components/security/DOMPurify";
import { CalendarEvent, updateCallback } from "../components/state/stores/CalendarEvent";
import { backendConfig } from "../configs/BackendConfig";
import { DataVersions } from "../configs/DataVersionsConfig";
import { frontendConfig } from "../configs/FrontendConfig";
import userSettings from "../configs/UserSettings";
import BackendStructure from "../configs/appStructure/BackendStructure";
import FrontendStructure from "../configs/appStructure/FrontendStructure";

const initialData: any = {}; 

export const realtimeData = useRealtimeData(sanitizeInitialData(initialData), sanitizeCallback(updateCallback));

// Updated cache data structure based on the provided tree structure
export interface CacheData extends Data {
  lastUpdated: string;
  userSettings: typeof userSettings;
  dataVersions: DataVersions;
  frontendStructure: FrontendStructure;
  backendStructure: BackendStructure;
  backendConfig: typeof backendConfig;
  frontendConfig: typeof frontendConfig
  realtimeData:  RealtimeData
  // fetchData?: (userId: string, dispatch:DataAnalysisDispatch) => Promise<void>;
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

  // Add the new top-level cache properties for additional phases
  ideationPhaseHook: typeof ideationPhaseHook;
  teamCreationPhaseHook: typeof teamCreationPhaseHook;
  productBrainstormingPhaseHook: typeof productBrainstormingPhaseHook;
  productLaunchPhaseHook: typeof productLaunchPhaseHook;
  dataAnalysisPhaseHook: typeof dataAnalysisPhaseHook;
  generalCommunicationFeaturesPhaseHook: typeof generalCommunicationFeaturesPhaseHook;

  // Add more top-level cache properties as needed
  fileType: string;
  calendarEvent: CalendarEvent; 
}

// Rest of the code remains unchanged...
