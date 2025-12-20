// ServerDesignDashboard.tsx
import { DesignDashboardBaseProps } from '@/app/pages/dashboards/DesignDashboard';
import { ApiConfig } from '@/app/api/ApiConfigService';
import { backendConfig } from "@/app/config/BackendConfig";
import { frontendConfig } from "@/app/config/FrontendConfig";
import Documentation from "@/app/components/styling/Documentation";
import MainConfig from "@/app/config/MainConfig";
import UserSettings from "@/app/config/UserSettings";
import DataVersionsConfig from "@/app/configs/DataVersionsConfig";
import BatchProcessingAndCache from "@/utils/BatchProcessingAndCache";
import { View, Text, StyleSheet } from 'react-native';
import BackendStructureWrapper from '@/app/config/appStructure/BackendStructureWrapper';
import { selectApiConfigs } from "@/app/state/redux/slices/ApiSlice";
import getAppPath from "@/app/config/appStructure/appPath";
import useFilePath from "@/app/hooks/useFilePath";
import { useSelector } from 'react-redux';
import React, { useEffect } from "react";
import { lazyLoadScriptConfig } from '@/app/config/LazyLoadScriptConfig'
import { DocumentBuilderConfig } from "@/app/config/DocumentBuilderConfig";
import BackendConfigComponent from '@/app/components/configs/BackendConfigComponent'
import FrontendConfigComponent from '@/app/components/configs/FrontendConfigComponent'
import ConfigurationServiceComponent from "@/app/components/configs/ConfigurationServiceComponent/ConfigurationServiceComponent";
import FrontendStructureViewer from '@/app/components/development/FrontendStructureViewer'
import BackendStructureViewer from '@/app/components/development/BackendStructureViewer'
import ApiConfigComponent from '@/app/components/configs/ApiConfigComponent'
import DocumentBuilderConfigComponent from '@/app/components/documents/DocumentBuilderConfigComponent'
import { CacheManager } from '@/app/libraries/cache/client/CacheManager';
import { CacheUtils } from '@/utils/cache/CacheUtils'
import FrontendCacheManager from '@/utils/cache/FrontendCacheManager'
import ReadAndWriteCache from '@/utils/ReadAndWriteCache'
import DataProcessingComponent from '@/app/components/models/data/DataProcessingComponent'
import MetadataViewer from '@/app/components/development/MetadataViewer'
import VersioningComponent from '@/src/app/hooks/VersioningComponent'
import AppCacheManagerBase from '@/src/utils/cache/AppCacheManager';
import GenerateComponent from '@/app/api/generateComponent';
import DetermineFileType from '@/app/components/configs/DetermineFileType';
import { GenerateUserPreferences } from '@/app/config/GenerateUserPreferences';
import { UserPreferences } from '@/app/typings/userTypes';
import UserPreference from '@/app/users/preferences/UserPreference';
import FrontendStructure from "@/app/config/appStructure/FrontendStructure";
import BackendStructure from "@/app/server/database/BackendStructure";

interface ServerDesignDashboardProps {
  // Server-specific props
  apiConfigs?: ApiConfig[];
  onConfigUpdate?: ((configs: ApiConfig[]) => void) | undefined;
  frontendStructure?: any; // Use any or a specific type
  backendStructure?: any;
}

const ServerDesignDashboard: React.FC<ServerDesignDashboardProps> = ({
  backendStructure,
  frontendStructure,
}) => {
  // Server-specific state
  const versionNumber = backendConfig.versionNumber;
  const appVersion = backendConfig.appVersion;
  const apiConfigs = useSelector(selectApiConfigs);

  const filePath = useFilePath();

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
      <DetermineFileType filePath={filePath}/>
      <GenerateCache />
      <GenerateComponent />
      <GenerateChatInterfaces />
      <GeneratedInterfaces />

      {/* Metadata & Preferences */}
      <MetadataViewer metadata={{} as UnifiedMetadata<>} />
      <UserPreference />
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

export type { ServerDesignDashboardProps };
