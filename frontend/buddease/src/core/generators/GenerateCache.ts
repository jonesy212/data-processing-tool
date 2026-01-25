// GenerateCache.ts

import { FileTypeEnum } from "@/core/documents/FileType";
import { updateCallback } from "@/core/pages/blog/UpdateCallbackUtils";
import type { CalendarEvent } from '@/core/calendar/CalendarEvent';
import FrontendStructure from "@/core/config/appStructure/FrontendStructure";
import BackendStructure from '@/core/server/database/BackendStructure';
import { backendConfig } from "@/core/config/BackendConfig";
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import { frontendConfig } from "@/core/config/FrontendConfig";
import userSettings from "@/core/config/UserSettings";
import type { DataVersions } from "@/core/configs/DataVersionsConfig";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import useRealtimeData from "@/core/hooks/commHooks/useRealtimeData";
import {
    useBrainstormingPhase,
    useMeetingsPhase,
    useProjectManagementPhase,
    useTeamBuildingPhase,
} from "@/core/hooks/phaseHooks/CollaborationPhaseHooks";
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
} from "@/core/hooks/phaseHooks/PhaseHooks";
import {
    darkModeTogglePhaseHook,
    notificationBarPhaseHook,
} from "@/core/hooks/userInterface/UIPhaseHooks";
import type { Data } from '@/core/models/data/Data';
import { sanitizeCallback, sanitizeInitialData } from '@/core/server/security/DOMPurify';
import type { RealtimeData } from "@/core/typings/realtimeTypes";
import type { VersionHistory } from "@/core/versions/VersionData";

const initialData: any = {}; 

export const realtimeData = useRealtimeData(sanitizeInitialData(initialData), sanitizeCallback(updateCallback));
// export const realtimeData = {} as RealtimeData<RealtimeDataEntity, RealtimeDataK, RealtimeDataMeta, RealtimeDataAttachment, RealtimeDataExcludedFields, RealtimeDataIncludedFields>

// Updated cache data structure based on the provided tree structure
export interface CacheData<  
    T extends BaseDataEntity,
    K extends T = T,
    Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
    AttachmentType extends Attachment = Attachment,
    ExcludedFields extends keyof T = DefaultExcludedFields<T>,
    IncludedFields extends keyof T = keyof T
> extends Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  _id: string,
  lastUpdated: VersionHistory<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  dataVersions: DataVersions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
  frontendStructure: FrontendStructure<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  backendStructure: BackendStructure,
  frontendConfig: typeof frontendConfig
  userSettings: typeof userSettings,
  realtimeData:  RealtimeData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  backendConfig: typeof backendConfig,
  // fetchData?: (userId: string, dispatch:DataAnalysisDispatch) => Promise<void>,
  // Add new top-level cache properties for UI phases
  notificationBarPhaseHook: typeof notificationBarPhaseHook,
  darkModeTogglePhaseHook: typeof darkModeTogglePhaseHook,
  authenticationPhaseHook: typeof authenticationPhaseHook,
  jobSearchPhaseHook: typeof jobSearchPhaseHook,
  recruiterDashboardPhaseHook: typeof recruiterDashboardPhaseHook,

  // Add new top-level cache properties for collaboration phases
  teamBuildingPhaseHook: typeof useTeamBuildingPhase,
  brainstormingPhaseHook: typeof useBrainstormingPhase,
  projectManagementPhaseHook: typeof useProjectManagementPhase,
  meetingsPhaseHook: typeof useMeetingsPhase,

  // Add the new top-level cache properties for additional phases
  ideationPhaseHook: typeof ideationPhaseHook,
  teamCreationPhaseHook: typeof teamCreationPhaseHook,
  productBrainstormingPhaseHook: typeof productBrainstormingPhaseHook,
  productLaunchPhaseHook: typeof productLaunchPhaseHook,
  dataAnalysisPhaseHook: typeof dataAnalysisPhaseHook,
  generalCommunicationFeaturesPhaseHook: typeof generalCommunicationFeaturesPhaseHook,
  
  // Add more top-level cache properties as needed
  fileType: FileTypeEnum,
  calendarEvent: CalendarEvent<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, 
  data: any,
}

