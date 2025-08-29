// ServerDesignDashboard.ts
import { ApiConfig } from '@/app/configs/ConfigurationService';
import { DesignDashboardBaseProps } from '@/app/pages/dashboards/DesignDashboard';

import FeedbackLoop from "@/app/components/FeedbackLoop";
import TaskAssignmentSnapshot from "@/app/components/actions/TaskAssignmentSnapshot";
import {
  AdminDashboard,
  AdminDashboardProps,
} from "@/app/components/admin/AdminDashboard";
import GoogleAnalyticsScript from "@/app/components/analytics/GoogleAnalyticsScript";
import CalendarComponent from "@/app/components/calendar/CalendarComponent";
import ChatCard from "@/app/components/cards/ChatCard";
import SendEmail from "@/app/components/communications/email/SendEmail";
import DynamicDashboard from "@/app/components/dashboards/DynamicDashboard";
import { IdeaLifecyclePhase } from "@/app/components/phases/PhaseManager";
import IdeaLifecycleManager from "@/app/components/phases/ideaPhase/IdeaLifecycleManager";
import LaunchPhase from "@/app/components/phases/onboarding/LaunchPhase";
import ProfileSetupPhase from "@/app/components/phases/onboarding/ProfileSetupPhase";
import PostLaunchActivitiesPhase from "@/app/components/phases/postLaunchPhase/PostLaunchActivitiesPhase";
import AnalyzeData from "@/app/components/projects/DataAnalysisPhase/AnalyzeData/AnalyzeData";
import TaskManagementManager from "@/app/components/projects/TaskManagementPhase";
import ClearingTimer from "@/app/components/projects/projectManagement/ClearingTimer";
import MainApplicationLogic from "@/app/components/projects/projectManagement/MainApplicationLogic";
import RemovingEventListeners from "@/app/components/projects/projectManagement/RemovingEventListeners";
import InviteFriends from "@/app/components/referrals/InviteFriends";
import ReferralSystem from "@/app/components/referrals/ReferralSystem";
import ProtectedRoute from "@/app/components/routing/ProtectedRoute";
import { AnimationsAndTransitions } from "@/app/components/styling/AnimationsAndTansitions";
import ColorPalette from "@/app/components/styling/ColorPalette";
import ColorPicker from "@/app/components/styling/ColorPicker";
import Documentation from "@/app/components/styling/Documentation";
import DynamicComponents from "@/app/components/styling/DynamicComponents";
import DynamicIconsAndImages from "@/app/components/styling/DynamicIconsAndImages";
import DynamicSpacingAndLayout from "@/app/components/styling/DynamicSpacingAndLayout";
import DynamicTypography, {
  BodyTextProps,
  DynamicTypographyProps,
  HeadingProps,
} from "@/app/components/styling/DynamicTypography";
import TaskManagerComponent from "@/app/components/tasks/TaskManagerComponent";
import TodoList from "@/app/components/todos/TodoList";
import ConceptDevelopment from "@/app/components/users/userJourney/ConceptDevelopment";
import ConceptValidation from "@/app/components/users/userJourney/ConceptValidation";
import IdeaLifecycle from "@/app/components/users/userJourney/IdeaLifecycle";
import IdeaValidation from "@/app/components/users/userJourney/IdeaValidation";
import IdeationPhase from "@/app/components/users/userJourney/IdeationPhase";
import ProofOfConcept from "@/app/components/users/userJourney/ProofOfConcept";
import RequirementsGathering from "@/app/components/users/userJourney/RequirementsGathering";
import TeamBuildingPhaseManagement from "@/app/components/users/userJourney/TeamBuildingPhaseManagement";
import DataVersionsConfig from "@/app/configs/DataVersionsConfig";
import MainConfig from "@/app/configs/MainConfig";
import UserPreferences from "@/app/configs/UserPreferences";
import UserSettings from "@/app/configs/UserSettings";
import { ModalGenerator } from "@/app/generators/GenerateModal";
import BatchProcessingAndCache from "@/app/utils/BatchProcessingAndCache";
import React, { useEffect, useState } from "react";
import PersonaBuilderDashboard from "../personas/recruiter_dashboard/PersonaBuilderDashboard";
import UserDashboard from "./UserDashboard";

interface ServerDesignDashboardProps extends DesignDashboardBaseProps {
    // Server-specific props
    apiConfigs: ApiConfig[];
    onConfigUpdate: (configs: ApiConfig[]) => void;
    // Other server-only props...
}
  

import { useSelector } from 'react-redux';
import { selectApiConfigs } from '@/app/store/slices/apiConfigSlice';
import { BackendStructureWrapper } from '@/app/components/backend/BackendStructureWrapper';
import { getAppPath } from '@/app/utils/pathUtils';

interface ServerDesignDashboardProps extends DesignDashboardBaseProps {
  // Server-specific props
  apiConfigs?: ApiConfig[];
  onConfigUpdate?: (configs: ApiConfig[]) => void;
}

const ServerDesignDashboard: React.FC<ServerDesignDashboardProps> = ({
  backendStructure,
  frontendStructure,
}) => {
  // Server-specific state
  const versionNumber = backendConfig.versionNumber;
  const appVersion = backendConfig.appVersion;
  const apiConfigs = useSelector(selectApiConfigs);
  const backendStructureWrapper = new BackendStructureWrapper(
    getAppPath(versionNumber, appVersion)
  );

  // Server-specific initialization
  useEffect(() => {
    // Server-side initialization logic
    lazyLoadScriptConfig.configureScript();
  }, []);

  return (
    <>
      <h1>Server Design Dashboard</h1>

      {/* Server Configuration Components */}
      <BackendConfigComponent backendConfig={backendConfig} />
      <FrontendConfigComponent config={frontendConfig} />
      <ConfigurationServiceComponent apiConfigs={apiConfigs} />
      
      {/* Structure Viewers */}
      <FrontendStructureViewer frontendStructure={frontendStructure} />
      <BackendStructureViewer backendStructure={backendStructure} />

      {/* Server Management Components */}
      <ApiConfigComponent />
      <DataVersionsConfig dataPath="" />
      <DocumentBuilderConfigComponent config={{} as DocumentBuilderConfig} />
      <MainConfig
        frontendStructure={frontendStructure}
        backendStructure={backendStructure}
        frontendConfig={frontendConfig}
        backendConfig={backendConfig}
      />

      {/* Cache Management */}
      <CacheManager />
      <BatchProcessingAndCache />
      <AppCacheManagerBase />
      <CacheUtils />
      <CleanupUtil />
      <FrontendCacheManager />
      <ReadAndWriteCache />

      {/* Data Processing */}
      <DataProcessingComponent datasetPath="" onDataProcessed={() => {}} />
      <DetermineFileType />
      <GenerateCache />
      <GenerateComponent />
      <GenerateChatInterfaces />
      <GeneratedInterfaces />

      {/* Metadata & Preferences */}
      <MetadataViewer metadata={{}} />
      <UpdatePreference />
      <GenerateUserPreferences />
      <UserPreferences />
      <UserSettings />

      {/* Utility Components */}
      <Global />
      <TraverseFrontend />
      <StyleSheet />
      <Favicon />
      <Documentation />
      <VersioningComponent version={""} />
    </>
  );
};

export default ServerDesignDashboard;

export type { ServerDesignDashboardProps} 