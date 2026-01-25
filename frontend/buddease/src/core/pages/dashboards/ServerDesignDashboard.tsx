// ServerDesignDashboard.tsx
import { ApiConfig } from '@/core/api/ApiConfigService';
import GenerateComponent from '@/core/api/generateComponent';
import ApiConfigComponent from '@/core/components/configs/ApiConfigComponent';
import BackendConfigComponent from '@/core/components/configs/BackendConfigComponent';
import ConfigurationServiceComponent from "@/core/components/configs/ConfigurationServiceComponent/ConfigurationServiceComponent";
import DetermineFileType from '@/core/components/configs/DetermineFileType';
import FrontendConfigComponent from '@/core/components/configs/FrontendConfigComponent';
import BackendStructureViewer from '@/core/components/development/BackendStructureViewer';
import FrontendStructureViewer from '@/core/components/development/FrontendStructureViewer';
import MetadataViewer from '@/core/components/development/MetadataViewer';
import DocumentBuilderConfigComponent from '@/core/components/documents/DocumentBuilderConfigComponent';
import DataProcessingComponent from '@/core/components/models/data/DataProcessingComponent';
import Documentation from "@/core/components/styling/Documentation";
import getAppPath from "@/core/config/appStructure/appPath";
import BackendStructureWrapper from '@/core/config/appStructure/BackendStructureWrapper';
import { backendConfig } from "@/core/config/BackendConfig";
import { DocumentBuilderConfig } from "@/core/config/DocumentBuilderConfig";
import { frontendConfig } from "@/core/config/FrontendConfig";
import { GenerateUserPreferences } from '@/core/config/GenerateUserPreferences';
import { lazyLoadScriptConfig } from '@/core/config/LazyLoadScriptConfig';
import MainConfig from "@/core/config/MainConfig";
import UserSettings from "@/core/config/UserSettings";
import DataVersionsConfig from "@/core/configs/DataVersionsConfig";
import useFilePath from "@/core/hooks/useFilePath";
import { CacheManager } from '@/core/libraries/cache/client/CacheManager';
import { selectApiConfigs } from "@/core/state/redux/slices/ApiSlice";
import { UserPreferences } from '@/core/typings/userTypes';
import UserPreference from '@/core/users/preferences/UserPreference';
import VersioningComponent from '@/src/app/hooks/VersioningComponent';
import AppCacheManagerBase from '@/src/utils/cache/AppCacheManager';
import BatchProcessingAndCache from "@/utils/BatchProcessingAndCache";
import { CacheUtils } from '@/utils/cache/CacheUtils';
import FrontendCacheManager from '@/utils/cache/FrontendCacheManager';
import ReadAndWriteCache from '@/utils/ReadAndWriteCache';
import React, { useEffect } from "react";
import { StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

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
